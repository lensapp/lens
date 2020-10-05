import type { ExtensionManifest } from "./lens-extension"
import path from "path"
import fs from "fs-extra"
import logger from "../main/logger"
import { withExtensionPackagesRoot, extensionPackagesRoot, InstalledExtension } from "./extension-loader"
import npm from "npm"

export class ExtensionManager {
  get extensionPackagesRoot() {
    return extensionPackagesRoot()
  }

  get folderPath(): string {
    return path.resolve(__static, "../extensions");
  }

  async load() {
    logger.info("[EXTENSION-MANAGER] loading extensions from " + this.extensionPackagesRoot)

    await fs.ensureDir(path.join(this.extensionPackagesRoot, "node_modules"))
    await fs.writeFile(path.join(this.extensionPackagesRoot, "package.json"), `{"dependencies": []}`, {mode: 0o600})

    return await this.loadExtensions();
  }

  async getExtensionByManifest(manifestPath: string): Promise<InstalledExtension> {
    let manifestJson: ExtensionManifest;
    try {
      manifestJson = __non_webpack_require__(manifestPath)
      withExtensionPackagesRoot(() => {
        this.installPackageFromPath(path.dirname(manifestPath))
      })

      logger.info("[EXTENSION-MANAGER] installed extension " + manifestJson.name)
      return {
        id: manifestJson.name,
        version: manifestJson.version,
        name: manifestJson.name,
        manifestPath: path.join(this.extensionPackagesRoot, "node_modules", manifestJson.name, "package.json"),
        manifest: manifestJson
      }
    } catch (err) {
      logger.error(`[EXTENSION-MANAGER]: can't install extension at ${manifestPath}: ${err}`, { manifestJson });
    }
  }

  protected installPackageFromPath(path: string): Promise<void> {
    const origLogger = console.log
    return new Promise((resolve, reject) => {
      npm.load({
        production: true,
        global: false,
        prefix: this.extensionPackagesRoot,
        dev: false,
        spin: false,
        "ignore-scripts": true,
        loglevel: "silent"
      }, (err) => {
        console.log = function() {
          // just to ignore ts empty function error
        }
        npm.commands.install([
          path
        ], (err) => {
          console.log = origLogger
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    })
  }

  async loadExtensions() {
    const extensions = await this.loadFromFolder(this.folderPath);
    return new Map(extensions.map(ext => [ext.id, ext]));
  }

  async loadFromFolder(folderPath: string): Promise<InstalledExtension[]> {
    const paths = await fs.readdir(folderPath);
    const manifestsLoading = paths.map(fileName => {
      const absPath = path.resolve(folderPath, fileName);
      const manifestPath = path.resolve(absPath, "package.json");
      return fs.access(manifestPath, fs.constants.F_OK)
        .then(async () => await this.getExtensionByManifest(manifestPath))
        .catch(() => null)
    });
    let extensions = await Promise.all(manifestsLoading);
    extensions = extensions.filter(v => !!v); // filter out files and invalid folders (without manifest.json)
    logger.debug(`[EXTENSION-MANAGER]: ${extensions.length} extensions loaded`, { folderPath, extensions });
    return extensions;
  }
}

export const extensionManager = new ExtensionManager()
