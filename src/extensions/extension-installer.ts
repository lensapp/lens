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

      logger.info(`${logModule} installing dependencies at ${extensionPackagesRoot()}`);
      await this.npm(["install", "--no-audit", "--only=prod", "--prefer-offline", "--no-package-lock"]);
      logger.info(`${logModule} dependencies installed at ${extensionPackagesRoot()}`);
    } finally {
      this.installLock.release();
    }
  }

  /**
   * Install single package using npm
   */
  async installPackage(name: string): Promise<void> {
    // Mutual exclusion to install packages in sequence
    await this.installLock.acquireAsync();

    try {
      logger.info(`${logModule} installing package from ${name} to ${extensionPackagesRoot()}`);
      await this.npm(["install", "--no-audit", "--only=prod", "--prefer-offline", "--no-package-lock", "--no-save", name]);
      logger.info(`${logModule} package ${name} installed to ${extensionPackagesRoot()}`);
    } finally {
      this.installLock.release();
    }
  }

  private npm(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = child_process.fork(this.npmPath, args, {
        cwd: extensionPackagesRoot(),
        silent: true,
        env: {}
      });
      let stderr = "";

      child.stderr.on("data", data => {
        stderr += String(data);
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(stderr));
        } else {
          resolve();
        }
      });

      child.on("error", error => {
        reject(error);
      });
    });
  }
}

export const extensionInstaller = new ExtensionInstaller();
