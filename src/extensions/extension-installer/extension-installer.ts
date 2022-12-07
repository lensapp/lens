/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import AwaitLock from "await-lock";
import child_process from "child_process";
import logger from "../../main/logger";

const logModule = "[EXTENSION-INSTALLER]";

interface Dependencies {
  extensionPackageRootDirectory: string;
}

const baseNpmInstallArgs = [
  "install",
  "--audit=false",
  "--fund=false",
  // NOTE: we do not omit the `optional` dependencies because that is how we specify the non-bundled extensions
  "--omit=dev",
  "--omit=peer",
  "--prefer-offline",
];

/**
 * Installs dependencies for extensions
 */
export class ExtensionInstaller {
  private installLock = new AwaitLock();

  constructor(private dependencies: Dependencies) {}

  get npmPath() {
    return __non_webpack_require__.resolve("npm");
  }

  /**
   * Install single package using npm
   */
  installPackage = async (name: string): Promise<void> => {
    // Mutual exclusion to install packages in sequence
    await this.installLock.acquireAsync();

    try {
      logger.info(`${logModule} installing package from ${name} to ${this.dependencies.extensionPackageRootDirectory}`);
      await this.npm(...baseNpmInstallArgs, name);
      logger.info(`${logModule} package ${name} installed to ${this.dependencies.extensionPackageRootDirectory}`);
    } finally {
      this.installLock.release();
    }
  };

  private npm(...args: string[]): Promise<void> {
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
