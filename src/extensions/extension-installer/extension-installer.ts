/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import AwaitLock from "await-lock";
import child_process from "child_process";
import fs from "fs-extra";
import path from "path";
import logger from "../../main/logger";
import type { PackageJson } from "type-fest";

const logModule = "[EXTENSION-INSTALLER]";

interface Dependencies {
  extensionPackageRootDirectory: string;
}

/**
 * Installs dependencies for extensions
 */
export class ExtensionInstaller {
  private installLock = new AwaitLock();

  constructor(private dependencies: Dependencies) {}

  get npmPath() {
    return __non_webpack_require__.resolve("npm/bin/npm-cli");
  }

  /**
   * Write package.json to the file system and execute npm install for it.
   */
  installPackages = async (packageJsonPath: string, packagesJson: PackageJson): Promise<void> => {
    // Mutual exclusion to install packages in sequence
    await this.installLock.acquireAsync();

    try {
      // Write the package.json which will be installed in .installDependencies()
      await fs.writeFile(path.join(packageJsonPath), JSON.stringify(packagesJson, null, 2), {
        mode: 0o600,
      });

      logger.info(`${logModule} installing dependencies at ${this.dependencies.extensionPackageRootDirectory}`);
      await this.npm(["install", "--no-audit", "--only=prod", "--prefer-offline", "--no-package-lock"]);
      logger.info(`${logModule} dependencies installed at ${this.dependencies.extensionPackageRootDirectory}`);
    } finally {
      this.installLock.release();
    }
  };

  /**
   * Install single package using npm
   */
  installPackage = async (name: string): Promise<void> => {
    // Mutual exclusion to install packages in sequence
    await this.installLock.acquireAsync();

    try {
      logger.info(`${logModule} installing package from ${name} to ${this.dependencies.extensionPackageRootDirectory}`);
      await this.npm(["install", "--no-audit", "--only=prod", "--prefer-offline", "--no-package-lock", "--no-save", name]);
      logger.info(`${logModule} package ${name} installed to ${this.dependencies.extensionPackageRootDirectory}`);
    } finally {
      this.installLock.release();
    }
  };

  private npm(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = child_process.fork(this.npmPath, args, {
        cwd: this.dependencies.extensionPackageRootDirectory,
        silent: true,
        env: {},
      });
      let stderr = "";

      child.stderr?.on("data", data => {
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
