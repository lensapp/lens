import type { ExtensionManifest } from "./lens-extension"
import path from "path"
import fs from "fs-extra"
import logger from "../main/logger"
import { extensionPackagesRoot, InstalledExtension } from "./extension-loader"
import * as child_process from 'child_process';

type Dependencies = {
  [name: string]: string;
}

type PackageJson = {
  dependencies: Dependencies;
}

export class ExtensionManager {

  protected packagesJson: PackageJson = {
    dependencies: {}
  }

  get extensionPackagesRoot() {
    return extensionPackagesRoot()
  }

  get folderPath(): string {
    return path.resolve(__static, "../extensions");
  }

  get npmPath() {
    return __non_webpack_require__.resolve('npm/bin/npm-cli')
  }

  async load() {
    logger.info("[EXTENSION-MANAGER] loading extensions from " + this.extensionPackagesRoot)
    await fs.ensureDir(path.join(this.extensionPackagesRoot, "node_modules"))

    return await this.loadExtensions();
  }

  async getExtensionByManifest(manifestPath: string): Promise<InstalledExtension> {
    let manifestJson: ExtensionManifest;
    try {
      manifestJson = __non_webpack_require__(manifestPath)
      this.packagesJson.dependencies[manifestJson.name] = path.dirname(manifestPath)

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

  protected installPackages(): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = child_process.fork(this.npmPath, ["install", "--silent"], {
        cwd: extensionPackagesRoot(),
        silent: true
      })
      child.on("close", () => {
        resolve()
      })
      child.on("error", (err) => {
        reject(err)
      })
    })
  }

  async loadExtensions() {
    const extensions = await this.loadFromFolder(this.folderPath);
    return new Map(extensions.map(ext => [ext.id, ext]));
  }

  async loadFromFolder(folderPath: string): Promise<InstalledExtension[]> {
    const paths = await fs.readdir(folderPath);
    const extensions: InstalledExtension[] = []
    for (const fileName of paths) {
      const absPath = path.resolve(folderPath, fileName);
      const manifestPath = path.resolve(absPath, "package.json");
      await fs.access(manifestPath, fs.constants.F_OK)
      const ext = await this.getExtensionByManifest(manifestPath).catch(() => null)
      if (ext) {
        extensions.push(ext)
      }
    }
    await fs.writeFile(path.join(this.extensionPackagesRoot, "package.json"), JSON.stringify(this.packagesJson), {mode: 0o600})
    await this.installPackages()

    logger.debug(`[EXTENSION-MANAGER]: ${extensions.length} extensions loaded`, { folderPath, extensions });
    return extensions;
  }
}

export const extensionManager = new ExtensionManager()
