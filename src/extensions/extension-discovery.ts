import { watch } from "chokidar";
import { ipcRenderer } from "electron";
import { EventEmitter } from "events";
import fse from "fs-extra";
import { observable, reaction, toJS, when } from "mobx";
import os from "os";
import path from "path";
import { broadcastMessage, handleRequest, requestMain, subscribeToBroadcast } from "../common/ipc";
import { Singleton } from "../common/utils";
import logger from "../main/logger";
import { ExtensionInstallationStateStore } from "../renderer/components/+extensions/extension-install.store";
import { extensionInstaller, PackageJson } from "./extension-installer";
import { ExtensionsStore } from "./extensions-store";
import { ExtensionLoader } from "./extension-loader";
import type { LensExtensionId, LensExtensionManifest } from "./lens-extension";

export interface InstalledExtension {
  id: LensExtensionId;

  readonly manifest: LensExtensionManifest;

  // Absolute path to the non-symlinked source folder,
  // e.g. "/Users/user/.k8slens/extensions/helloworld"
  readonly absolutePath: string;

  // Absolute to the symlinked package.json file
  readonly manifestPath: string;
  readonly isBundled: boolean; // defined in project root's package.json
  isEnabled: boolean;
}

const logModule = "[EXTENSION-DISCOVERY]";

export const manifestFilename = "package.json";

interface ExtensionDiscoveryChannelMessage {
  isLoaded: boolean;
}

/**
 * Returns true if the lstat is for a directory-like file (e.g. isDirectory or symbolic link)
 * @param lstat the stats to compare
 */
const isDirectoryLike = (lstat: fse.Stats) => lstat.isDirectory() || lstat.isSymbolicLink();

interface LoadFromFolderOptions {
  isBundled?: boolean;
}

/**
 * Discovers installed bundled and local extensions from the filesystem.
 * Also watches for added and removed local extensions by watching the directory.
 * Uses ExtensionInstaller to install dependencies for all of the extensions.
 * This is also done when a new extension is copied to the local extensions directory.
 * .init() must be called to start the directory watching.
 * The class emits events for added and removed extensions:
 * - "add": When extension is added. The event is of type InstalledExtension
 * - "remove": When extension is removed. The event is of type LensExtensionId
 */
export class ExtensionDiscovery extends Singleton {
  protected bundledFolderPath: string;

  private loadStarted = false;
  private extensions: Map<string, InstalledExtension> = new Map();

  // True if extensions have been loaded from the disk after app startup
  @observable isLoaded = false;
  whenLoaded = when(() => this.isLoaded);

  // IPC channel to broadcast changes to extension-discovery from main
  protected static readonly extensionDiscoveryChannel = "extension-discovery:main";

  public events = new EventEmitter();

  get localFolderPath(): string {
    return path.join(os.homedir(), ".k8slens", "extensions");
  }

  get packageJsonPath() {
    return path.join(extensionInstaller.extensionPackagesRoot, manifestFilename);
  }

  get inTreeTargetPath() {
    return path.join(extensionInstaller.extensionPackagesRoot, "extensions");
  }

  get inTreeFolderPath(): string {
    return path.resolve(__static, "../extensions");
  }

  get nodeModulesPath(): string {
    return path.join(extensionInstaller.extensionPackagesRoot, "node_modules");
  }

  /**
   * Initializes the class and setups the file watcher for added/removed local extensions.
   */
  async init() {
    if (ipcRenderer) {
      await this.initRenderer();
    } else {
      await this.initMain();
    }
  }

  async initRenderer() {
    const onMessage = ({ isLoaded }: ExtensionDiscoveryChannelMessage) => {
      this.isLoaded = isLoaded;
    };

    requestMain(ExtensionDiscovery.extensionDiscoveryChannel).then(onMessage);
    subscribeToBroadcast(ExtensionDiscovery.extensionDiscoveryChannel, (_event, message: ExtensionDiscoveryChannelMessage) => {
      onMessage(message);
    });
  }

  async initMain() {
    handleRequest(ExtensionDiscovery.extensionDiscoveryChannel, () => this.toJSON());

    reaction(() => this.toJSON(), () => {
      this.broadcast();
    });
  }

  /**
   * Watches for added/removed local extensions.
   * Dependencies are installed automatically after an extension folder is copied.
   */
  async watchExtensions() {
    logger.info(`${logModule} watching extension add/remove in ${this.localFolderPath}`);

    // Wait until .load() has been called and has been resolved
    await this.whenLoaded;

    // chokidar works better than fs.watch
    watch(this.localFolderPath, {
      // For adding and removing symlinks to work, the depth has to be 1.
      depth: 1,
      ignoreInitial: true,
      // Try to wait until the file has been completely copied.
      // The OS might emit an event for added file even it's not completely written to the file-system.
      awaitWriteFinish: {
        // Wait 300ms until the file size doesn't change to consider the file written.
        // For a small file like package.json this should be plenty of time.
        stabilityThreshold: 300
      }
    })
      // Extension add is detected by watching "<extensionDir>/package.json" add
      .on("add", this.handleWatchFileAdd)
      // Extension remove is detected by watching "<extensionDir>" unlink
      .on("unlinkDir", this.handleWatchUnlinkEvent)
      // Extension remove is detected by watching "<extensionSymLink>" unlink
      .on("unlink", this.handleWatchUnlinkEvent);
  }

  handleWatchFileAdd =  async (manifestPath: string) => {
    // e.g. "foo/package.json"
    const relativePath = path.relative(this.localFolderPath, manifestPath);

    // Converts "foo/package.json" to ["foo", "package.json"], where length of 2 implies
    // that the added file is in a folder under local folder path.
    // This safeguards against a file watch being triggered under a sub-directory which is not an extension.
    const isUnderLocalFolderPath = relativePath.split(path.sep).length === 2;

    if (path.basename(manifestPath) === manifestFilename && isUnderLocalFolderPath) {
      try {
        ExtensionInstallationStateStore.setInstallingFromMain(manifestPath);
        const absPath = path.dirname(manifestPath);

        // this.loadExtensionFromPath updates this.packagesJson
        const extension = await this.loadExtensionFromFolder(absPath);

        if (extension) {
          // Remove a broken symlink left by a previous installation if it exists.
          await fse.remove(extension.manifestPath);

          // Install dependencies for the new extension
          await this.installPackage(extension.absolutePath);

          this.extensions.set(extension.id, extension);
          logger.info(`${logModule} Added extension ${extension.manifest.name}`);
          this.events.emit("add", extension);
        }
      } catch (error) {
        logger.error(`${logModule}: failed to add extension: ${error}`, { error });
      } finally {
        ExtensionInstallationStateStore.clearInstallingFromMain(manifestPath);
      }
    }
  };

  /**
   * Handle any unlink event, filtering out non-package.json links so the delete code
   * only happens once per extension.
   * @param filePath The absolute path to either a folder or file in the extensions folder
   */
  handleWatchUnlinkEvent = async (filePath: string): Promise<void> => {
    // Check that the removed path is directly under this.localFolderPath
    // Note that the watcher can create unlink events for subdirectories of the extension
    const extensionFolderName = path.basename(filePath);
    const expectedPath = path.relative(this.localFolderPath, filePath);

    if (expectedPath !== extensionFolderName) {
      return;
    }

    const extension = Array.from(this.extensions.values()).find((extension) => extension.absolutePath === filePath);

    if (!extension) {
      return void logger.warn(`${logModule} extension ${extensionFolderName} not found, can't remove`);
    }

    const extensionName = extension.manifest.name;

    // If the extension is deleted manually while the application is running, also remove the symlink
    await this.removeSymlinkByPackageName(extensionName);

    // The path to the manifest file is the lens extension id
    // Note: that we need to use the symlinked path
    const lensExtensionId = extension.manifestPath;

    this.extensions.delete(extension.id);
    logger.info(`${logModule} removed extension ${extensionName}`);
    this.events.emit("remove", lensExtensionId);
  };

  /**
   * Remove the symlink under node_modules if exists.
   * If we don't remove the symlink, the uninstall would leave a non-working symlink,
   * which wouldn't be fixed if the extension was reinstalled, causing the extension not to work.
   * @param name e.g. "@mirantis/lens-extension-cc"
   */
  removeSymlinkByPackageName(name: string) {
    return fse.remove(this.getInstalledPath(name));
  }

  /**
   * Uninstalls extension.
   * The application will detect the folder unlink and remove the extension from the UI automatically.
   * @param extensionId The ID of the extension to uninstall.
   */
  async uninstallExtension(extensionId: LensExtensionId) {
    const { manifest, absolutePath } = this.extensions.get(extensionId) ?? ExtensionLoader.getInstance().getExtension(extensionId);

    logger.info(`${logModule} Uninstalling ${manifest.name}`);

    await this.removeSymlinkByPackageName(manifest.name);

    // fs.remove does nothing if the path doesn't exist anymore
    await fse.remove(absolutePath);
  }

  async load(): Promise<Map<LensExtensionId, InstalledExtension>> {
    if (this.loadStarted) {
      // The class is simplified by only supporting .load() to be called once
      throw new Error("ExtensionDiscovery.load() can be only be called once");
    }

    this.loadStarted = true;

    logger.info(`${logModule} loading extensions from ${extensionInstaller.extensionPackagesRoot}`);

    // fs.remove won't throw if path is missing
    await fse.remove(path.join(extensionInstaller.extensionPackagesRoot, "package-lock.json"));

    try {
      // Verify write access to static/extensions, which is needed for symlinking
      await fse.access(this.inTreeFolderPath, fse.constants.W_OK);

      // Set bundled folder path to static/extensions
      this.bundledFolderPath = this.inTreeFolderPath;
    } catch {
      // If there is error accessing static/extensions, we need to copy in-tree extensions so that we can symlink them properly on "npm install".
      // The error can happen if there is read-only rights to static/extensions, which would fail symlinking.

      // Remove e.g. /Users/<username>/Library/Application Support/LensDev/extensions
      await fse.remove(this.inTreeTargetPath);

      // Create folder e.g. /Users/<username>/Library/Application Support/LensDev/extensions
      await fse.ensureDir(this.inTreeTargetPath);

      // Copy static/extensions to e.g. /Users/<username>/Library/Application Support/LensDev/extensions
      await fse.copy(this.inTreeFolderPath, this.inTreeTargetPath);

      // Set bundled folder path to e.g. /Users/<username>/Library/Application Support/LensDev/extensions
      this.bundledFolderPath = this.inTreeTargetPath;
    }

    await fse.ensureDir(this.nodeModulesPath);
    await fse.ensureDir(this.localFolderPath);

    const extensions = await this.ensureExtensions();

    this.isLoaded = true;

    return extensions;
  }

  /**
   * Returns the symlinked path to the extension folder,
   * e.g. "/Users/<username>/Library/Application Support/Lens/node_modules/@publisher/extension"
   */
  protected getInstalledPath(name: string) {
    return path.join(this.nodeModulesPath, name);
  }

  /**
   * Returns the symlinked path to the package.json,
   * e.g. "/Users/<username>/Library/Application Support/Lens/node_modules/@publisher/extension/package.json"
   */
  protected getInstalledManifestPath(name: string) {
    return path.join(this.getInstalledPath(name), manifestFilename);
  }

  /**
   * Returns InstalledExtension from path to package.json file.
   * Also updates this.packagesJson.
   */
  protected async getByManifest(manifestPath: string, { isBundled = false } = {}): Promise<InstalledExtension | null> {
    try {
      const manifest = await fse.readJson(manifestPath);
      const installedManifestPath = this.getInstalledManifestPath(manifest.name);
      const isEnabled = isBundled || ExtensionsStore.getInstance().isEnabled(installedManifestPath);

      return {
        id: installedManifestPath,
        absolutePath: path.dirname(manifestPath),
        manifestPath: installedManifestPath,
        manifest,
        isBundled,
        isEnabled
      };
    } catch (error) {
      if (error.code === "ENOTDIR") {
        // ignore this error, probably from .DS_Store file
        logger.debug(`${logModule}: failed to load extension manifest through a not-dir-like at ${manifestPath}`);
      } else {
        logger.error(`${logModule}: can't load extension manifest at ${manifestPath}: ${error}`);
      }

      return null;
    }
  }

  async ensureExtensions(): Promise<Map<LensExtensionId, InstalledExtension>> {
    const bundledExtensions = await this.loadBundledExtensions();

    await this.installBundledPackages(this.packageJsonPath, bundledExtensions);

    const userExtensions = await this.loadFromFolder(this.localFolderPath, bundledExtensions.map((extension) => extension.manifest.name));

    for (const extension of userExtensions) {
      if (await fse.pathExists(extension.manifestPath) === false) {
        await this.installPackage(extension.absolutePath);
      }
    }
    const extensions = bundledExtensions.concat(userExtensions);

    return this.extensions = new Map(extensions.map(extension => [extension.id, extension]));
  }

  /**
   * Write package.json to file system and install dependencies.
   */
  async installBundledPackages(packageJsonPath: string, extensions: InstalledExtension[]) {
    const packagesJson: PackageJson = {
      dependencies: {}
    };

    extensions.forEach((extension) => {
      packagesJson.dependencies[extension.manifest.name] = extension.absolutePath;
    });

    return await extensionInstaller.installPackages(packageJsonPath, packagesJson);
  }

  async installPackage(name: string) {
    return extensionInstaller.installPackage(name);
  }

  async loadBundledExtensions() {
    const extensions: InstalledExtension[] = [];
    const folderPath = this.bundledFolderPath;
    const paths = await fse.readdir(folderPath);

    for (const fileName of paths) {
      const absPath = path.resolve(folderPath, fileName);
      const extension = await this.loadExtensionFromFolder(absPath, { isBundled: true });

      if (extension) {
        extensions.push(extension);
      }
    }
    logger.debug(`${logModule}: ${extensions.length} extensions loaded`, { folderPath, extensions });

    return extensions;
  }

  async loadFromFolder(folderPath: string, bundledExtensions: string[]): Promise<InstalledExtension[]> {
    const extensions: InstalledExtension[] = [];
    const paths = await fse.readdir(folderPath);

    for (const fileName of paths) {
      // do not allow to override bundled extensions
      if (bundledExtensions.includes(fileName)) {
        continue;
      }

      const absPath = path.resolve(folderPath, fileName);

      if (!fse.existsSync(absPath)) {
        continue;
      }

      const lstat = await fse.lstat(absPath);

      // skip non-directories
      if (!isDirectoryLike(lstat)) {
        continue;
      }

      const extension = await this.loadExtensionFromFolder(absPath);

      if (extension) {
        extensions.push(extension);
      }
    }

    logger.debug(`${logModule}: ${extensions.length} extensions loaded`, { folderPath, extensions });

    return extensions;
  }

  /**
   * Loads extension from absolute path, updates this.packagesJson to include it and returns the extension.
   * @param folderPath Folder path to extension
   */
  async loadExtensionFromFolder(folderPath: string, { isBundled = false }: LoadFromFolderOptions = {}): Promise<InstalledExtension | null> {
    const manifestPath = path.resolve(folderPath, manifestFilename);

    return this.getByManifest(manifestPath, { isBundled });
  }

  toJSON(): ExtensionDiscoveryChannelMessage {
    return toJS({
      isLoaded: this.isLoaded
    }, {
      recurseEverything: true
    });
  }

  broadcast() {
    broadcastMessage(ExtensionDiscovery.extensionDiscoveryChannel, this.toJSON());
  }
}
