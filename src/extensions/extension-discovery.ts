import chokidar from "chokidar";
import { EventEmitter } from "events";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { getBundledExtensions } from "../common/utils/app-version";
import logger from "../main/logger";
import { extensionInstaller, PackageJson } from "./extension-installer";
import { extensionsStore } from "./extensions-store";
import type { LensExtensionId, LensExtensionManifest } from "./lens-extension";

export interface InstalledExtension {
    readonly manifest: LensExtensionManifest;
    readonly manifestPath: string;
    readonly isBundled: boolean; // defined in project root's package.json
    isEnabled: boolean;
  }

const logModule = "[EXTENSION-DISCOVERY]";
const manifestFilename = "package.json";

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

  // This promise is resolved when .load() is finished.
  // This allows operations to be added after .load() success.
  private loaded: Promise<void>;

  // These are called to either resolve or reject this.loaded promise
  private resolveLoaded: () => void;
  private rejectLoaded: (error: any) => void;

  public events: EventEmitter;

  constructor() {
    this.loaded = new Promise((resolve, reject) => {
      this.resolveLoaded = resolve;
      this.rejectLoaded = reject;
    });

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
  init() {
    this.watchExtensions();
  }

  /**
   * Watches for added/removed local extensions.
   * Dependencies are installed automatically after an extension folder is copied.
   */
  async watchExtensions() {
    logger.info(`${logModule} watching extension add/remove in ${this.localFolderPath}`);

    // Wait until .load() has been called and has been resolved
    await this.loaded;

    // chokidar works better than fs.watch
    chokidar.watch(this.localFolderPath, {
      // Dont watch recursively into subdirectories
      depth: 0,
      // Try to wait until the file has been completely copied.
      // The OS might emit an event for added file even it's not completely written to the filesysten.
      awaitWriteFinish: {
        // Wait 300ms until the file size doesn't change to consider the file written.
        // For a small file like package.json this should be plenty of time.
        stabilityThreshold: 300
      }
    })
      // Extension add is detected by watching "<extensionDir>package.json" add
      .on("add", this.handleWatchFileAdd)
      // Extension remove is detected by watching <extensionDir>" unlink
      .on("unlinkDir", this.handleWatchUnlinkDir);
  }

  handleWatchFileAdd =  async (filePath: string) => {
    if (path.basename(filePath) === manifestFilename) {
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
        .find(([_name, extensionFolder]) => filePath === extensionFolder)?.[0];

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

  async load(): Promise<Map<LensExtensionId, InstalledExtension>> {
    if (this.loadStarted) {
      // The class is simplified by only supporting .load() to be called once
      throw new Error("ExtensionDiscovery.load() can be only be called once");
    }

    this.loadStarted = true;

    try {
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

      // resolve the loaded promise
      this.resolveLoaded();

      return extensions;
    } catch (error) {
      this.rejectLoaded(error);
    }
  }

  protected async getByManifest(manifestPath: string, { isBundled = false }: {
    isBundled?: boolean;
  } = {}): Promise<InstalledExtension | null> {
    let manifestJson: LensExtensionManifest;
    let isEnabled: boolean;

    try {
      // check manifest file for existence
      fs.accessSync(manifestPath, fs.constants.F_OK);

      manifestJson = __non_webpack_require__(manifestPath);
      const installedManifestPath = path.join(this.nodeModulesPath, manifestJson.name, "package.json");
      this.packagesJson.dependencies[manifestJson.name] = path.dirname(manifestPath);
      const isEnabled = isBundled || extensionsStore.isEnabled(installedManifestPath);

      return {
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

    return new Map(extensions.map(ext => [ext.manifestPath, ext]));
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
}

export const extensionDiscovery = new ExtensionDiscovery();