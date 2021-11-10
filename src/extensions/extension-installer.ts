/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import AwaitLock from "await-lock";
import child_process from "child_process";
import fs from "fs-extra";
import path from "path";
import logger from "../common/logger";
import { extensionPackagesRoot } from "./extension-loader";
import type { PackageJson } from "type-fest";

const logModule = "[EXTENSION-INSTALLER]";


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
        mode: 0o600,
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
        env: {},
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
