import { watch } from "chokidar";
import { ipcRenderer } from "electron";
import { EventEmitter } from "events";
import fs from "fs-extra";
import { observable, reaction, toJS, when } from "mobx";
import os from "os";
import path from "path";
import { broadcastMessage, handleRequest, requestMain, subscribeToBroadcast } from "../common/ipc";
import { getBundledExtensions } from "../common/utils/app-version";
import logger from "../main/logger";
import { extensionInstaller, PackageJson } from "./extension-installer";
import { extensionsStore } from "./extensions-store";
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
const isDirectoryLike = (lstat: fs.Stats) => lstat.isDirectory() || lstat.isSymbolicLink();

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
export class ExtensionDiscovery {
  protected bundledFolderPath: string;

  private loadStarted = false;

  // True if extensions have been loaded from the disk after app startup
  @observable isLoaded = false;
  whenLoaded = when(() => this.isLoaded);

  // IPC channel to broadcast changes to extension-discovery from main
  protected static readonly extensionDiscoveryChannel = "extension-discovery:main";

  public events: EventEmitter;

  constructor() {
    this.events = new EventEmitter();
  }

  // Each extension is added as a single dependency to this object, which is written as package.json.
  // Each dependency key is the name of the dependency, and
  // each dependency value is the non-symlinked path to the dependency (folder).
  protected packagesJson: PackageJson = {
    dependencies: {}
  };

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
    this.watchExtensions();
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
      // Try to wait until the file has been completely copied.
      // The OS might emit an event for added file even it's not completely written to the filesysten.
      awaitWriteFinish: {
        // Wait 300ms until the file size doesn't change to consider the file written.
        // For a small file like package.json this should be plenty of time.
        stabilityThreshold: 300
      }
    })
      // Extension add is detected by watching "<extensionDir>/package.json" add
      .on("add", this.handleWatchFileAdd)
      // Extension remove is detected by watching <extensionDir>" unlink
      .on("unlinkDir", this.handleWatchUnlinkDir);
  }

  handleWatchFileAdd =  async (filePath: string) => {
    // e.g. "foo/package.json"
    const relativePath = path.relative(this.localFolderPath, filePath);

    // Converts "foo/package.json" to ["foo", "package.json"], where length of 2 implies
    // that the added file is in a folder under local folder path.
    // This safeguards against a file watch being triggered under a sub-directory which is not an extension.
    const isUnderLocalFolderPath = relativePath.split(path.sep).length === 2;

    if (path.basename(filePath) === manifestFilename && isUnderLocalFolderPath) {
      try {
        const absPath = path.dirname(filePath);

        // this.loadExtensionFromPath updates this.packagesJson
        const extension = await this.loadExtensionFromPath(absPath);

        if (extension) {
          // Install dependencies for the new extension
          await this.installPackages();

          logger.info(`${logModule} Added extension ${extension.manifest.name}`);
          this.events.emit("add", extension);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  handleWatchUnlinkDir = async (filePath: string) => {
    // filePath is the non-symlinked path to the extension folder
    // this.packagesJson.dependencies value is the non-symlinked path to the extension folder
    // LensExtensionId in extension-loader is the symlinked path to the extension folder manifest file

    // Check that the removed path is directly under this.localFolderPath
    // Note that the watcher can create unlink events for subdirectories of the extension
    const extensionFolderName = path.basename(filePath);

    if (path.relative(this.localFolderPath, filePath) === extensionFolderName) {
      const extensionName: string | undefined = Object
        .entries(this.packagesJson.dependencies)
        .find(([, extensionFolder]) => filePath === extensionFolder)?.[0];

      if (extensionName !== undefined) {
        delete this.packagesJson.dependencies[extensionName];

        // Reinstall dependencies to remove the extension from package.json
        await this.installPackages();

        // The path to the manifest file is the lens extension id
        // Note that we need to use the symlinked path
        const lensExtensionId = path.join(this.nodeModulesPath, extensionName, "package.json");

        logger.info(`${logModule} removed extension ${extensionName}`);
        this.events.emit("remove", lensExtensionId as LensExtensionId);
      } else {
        logger.warn(`${logModule} extension ${extensionFolderName} not found, can't remove`);
      }
    }
  };

  /**
   * Uninstalls extension by path.
   * The application will detect the folder unlink and remove the extension from the UI automatically.
   * @param absolutePath Path to the non-symlinked folder of the extension
   */
  async uninstallExtension(absolutePath: string) {
    logger.info(`${logModule} Uninstalling ${absolutePath}`);

    const exists = await fs.pathExists(absolutePath);

    if (!exists) {
      throw new Error(`Extension path ${absolutePath} doesn't exist`);
    }

    // fs.remove does nothing if the path doesn't exist anymore
    await fs.remove(absolutePath);
  }

  async load(): Promise<Map<LensExtensionId, InstalledExtension>> {
    if (this.loadStarted) {
      // The class is simplified by only supporting .load() to be called once
      throw new Error("ExtensionDiscovery.load() can be only be called once");
    }

    this.loadStarted = true;

    logger.info(`${logModule} loading extensions from ${extensionInstaller.extensionPackagesRoot}`);

    if (fs.existsSync(path.join(extensionInstaller.extensionPackagesRoot, "package-lock.json"))) {
      await fs.remove(path.join(extensionInstaller.extensionPackagesRoot, "package-lock.json"));
    }

    try {
      await fs.access(this.inTreeFolderPath, fs.constants.W_OK);
      this.bundledFolderPath = this.inTreeFolderPath;
    } catch {
      // we need to copy in-tree extensions so that we can symlink them properly on "npm install"
      await fs.remove(this.inTreeTargetPath);
      await fs.ensureDir(this.inTreeTargetPath);
      await fs.copy(this.inTreeFolderPath, this.inTreeTargetPath);
      this.bundledFolderPath = this.inTreeTargetPath;
    }

    await fs.ensureDir(this.nodeModulesPath);
    await fs.ensureDir(this.localFolderPath);

    const extensions = await this.loadExtensions();

    this.isLoaded = true;
    
    return extensions;
  }

  protected async getByManifest(manifestPath: string, { isBundled = false }: {
    isBundled?: boolean;
  } = {}): Promise<InstalledExtension | null> {
    let manifestJson: LensExtensionManifest;

    try {
      // check manifest file for existence
      fs.accessSync(manifestPath, fs.constants.F_OK);

      manifestJson = __non_webpack_require__(manifestPath);
      const installedManifestPath = path.join(this.nodeModulesPath, manifestJson.name, "package.json");

      this.packagesJson.dependencies[manifestJson.name] = path.dirname(manifestPath);
      const isEnabled = isBundled || extensionsStore.isEnabled(installedManifestPath);

      return {
        id: installedManifestPath,
        absolutePath: path.dirname(manifestPath),
        manifestPath: installedManifestPath,
        manifest: manifestJson,
        isBundled,
        isEnabled
      };
    } catch (error) {
      logger.error(`${logModule}: can't install extension at ${manifestPath}: ${error}`, { manifestJson });

      return null;
    }
  }

  async loadExtensions(): Promise<Map<LensExtensionId, InstalledExtension>> {
    const bundledExtensions = await this.loadBundledExtensions();
    const localExtensions = await this.loadFromFolder(this.localFolderPath);

    await this.installPackages();
    const extensions = bundledExtensions.concat(localExtensions);

    return new Map(extensions.map(extension => [extension.id, extension]));
  }

  /**
   * Write package.json to file system and install dependencies.
   */
  installPackages() {
    return extensionInstaller.installPackages(this.packageJsonPath, this.packagesJson);
  }

  async loadBundledExtensions() {
    const extensions: InstalledExtension[] = [];
    const folderPath = this.bundledFolderPath;
    const bundledExtensions = getBundledExtensions();
    const paths = await fs.readdir(folderPath);

    for (const fileName of paths) {
      if (!bundledExtensions.includes(fileName)) {
        continue;
      }

      const absPath = path.resolve(folderPath, fileName);
      const extension = await this.loadExtensionFromPath(absPath, { isBundled: true });

      if (extension) {
        extensions.push(extension);
      }
    }
    logger.debug(`${logModule}: ${extensions.length} extensions loaded`, { folderPath, extensions });

    return extensions;
  }

  async loadFromFolder(folderPath: string): Promise<InstalledExtension[]> {
    const bundledExtensions = getBundledExtensions();
    const extensions: InstalledExtension[] = [];
    const paths = await fs.readdir(folderPath);

    for (const fileName of paths) {
      // do not allow to override bundled extensions
      if (bundledExtensions.includes(fileName)) {
        continue;
      }

      const absPath = path.resolve(folderPath, fileName);

      if (!fs.existsSync(absPath)) {
        continue;
      }

      const lstat = await fs.lstat(absPath);

      // skip non-directories
      if (!isDirectoryLike(lstat)) {
        continue;
      }

      const extension = await this.loadExtensionFromPath(absPath);

      if (extension) {
        extensions.push(extension);
      }
    }

    logger.debug(`${logModule}: ${extensions.length} extensions loaded`, { folderPath, extensions });

    return extensions;
  }

  /**
   * Loads extension from absolute path, updates this.packagesJson to include it and returns the extension.
   */
  async loadExtensionFromPath(absPath: string, { isBundled = false }: {
    isBundled?: boolean;
  } = {}): Promise<InstalledExtension | null> {
    const manifestPath = path.resolve(absPath, manifestFilename);

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

export const extensionDiscovery = new ExtensionDiscovery();
