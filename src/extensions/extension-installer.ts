import AwaitLock from "await-lock";
import child_process from "child_process";
import fs from "fs-extra";
import path from "path";
import logger from "../main/logger";
import { extensionPackagesRoot } from "./extension-loader";

const logModule = "[EXTENSION-INSTALLER]";

type Dependencies = {
  [name: string]: string;
};

// Type for the package.json file that is written by ExtensionInstaller
export type PackageJson = {
  dependencies: Dependencies;
};

/**
 * Installs dependencies for extensions
 */
export class ExtensionInstaller {
  private installLock = new AwaitLock();

  get extensionPackagesRoot() {
    return extensionPackagesRoot();
  }

  get npmPath() {
    return __non_webpack_require__.resolve("npm/bin/npm-cli");
  }

  installDependencies(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.info(`${logModule} installing dependencies at ${extensionPackagesRoot()}`);
      const child = child_process.fork(this.npmPath, ["install", "--silent", "--no-audit", "--only=prod", "--prefer-offline", "--no-package-lock"], {
        cwd: extensionPackagesRoot(),
        silent: true
      });

      child.on("close", () => {
        resolve();
      });
      child.on("error", (err) => {
        reject(err);
      });
    });
  }

  /**
   * Write package.json to the file system and execute npm install for it.
   */
  async installPackages(packageJsonPath: string, packagesJson: PackageJson): Promise<void> {
    // Mutual exclusion to install packages in sequence
    await this.installLock.acquireAsync();

    try {
    // Write the package.json which will be installed in .installDependencies()
      await fs.writeFile(path.join(packageJsonPath), JSON.stringify(packagesJson, null, 2), {
        mode: 0o600
      });

      await this.installDependencies();
    } finally {
      this.installLock.release();
    }
  }
}

export const extensionInstaller = new ExtensionInstaller();
