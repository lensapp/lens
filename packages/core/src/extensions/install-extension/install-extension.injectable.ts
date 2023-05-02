/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { fork } from "child_process";
import AwaitLock from "await-lock";
import pathToNpmCliInjectable from "../../common/app-paths/path-to-npm-cli.injectable";
import extensionPackageRootDirectoryInjectable from "./extension-package-root-directory.injectable";
import { prefixedLoggerInjectable } from "@k8slens/logger";
import readJsonFileInjectable from "../../common/fs/read-json-file.injectable";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import type { PackageJson } from "../common-api";
import writeJsonFileInjectable from "../../common/fs/write-json-file.injectable";
import { once } from "lodash";
import { isErrnoException } from "@k8slens/utilities";

const baseNpmInstallArgs = [
  "install",
  "--save-optional",
  "--audit=false",
  "--fund=false",
  // NOTE: we do not omit the `optional` dependencies because that is how we specify the non-bundled extensions
  "--omit=dev",
  "--omit=peer",
  "--prefer-offline",
];

export type InstallExtension = (name: string) => Promise<void>;

const installExtensionInjectable = getInjectable({
  id: "install-extension",
  instantiate: (di): InstallExtension => {
    const pathToNpmCli = di.inject(pathToNpmCliInjectable);
    const extensionPackageRootDirectory = di.inject(extensionPackageRootDirectoryInjectable);
    const readJsonFile = di.inject(readJsonFileInjectable);
    const writeJsonFile = di.inject(writeJsonFileInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const logger = di.inject(prefixedLoggerInjectable, "EXTENSION-INSTALLER");

    const forkNpm = (...args: string[]) => new Promise<void>((resolve, reject) => {
      const child = fork(pathToNpmCli, args, {
        cwd: extensionPackageRootDirectory,
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

    const packageJsonPath = joinPaths(extensionPackageRootDirectory, "package.json");

    /**
     * NOTES:
     *   - We have to keep the `package.json` because `npm install` removes files from `node_modules`
     *     if they are no longer in the `package.json`
     *   - In v6.2.X we saved bundled extensions as `"dependencies"` and external extensions as
     *     `"optionalDependencies"` at startup. This was done because `"optionalDependencies"` can
     *     fail to install and that is OK.
     *   - We continue to maintain this behavior here by only installing new dependencies as
     *     `"optionalDependencies"`
     */
    const fixupPackageJson = once(async () => {
      try {
        const packageJson = await readJsonFile(packageJsonPath) as PackageJson;

        delete packageJson.dependencies;

        await writeJsonFile(packageJsonPath, packageJson);
      } catch (error) {
        if (isErrnoException(error) && error.code === "ENOENT") {
          return;
        }

        throw error;
      }
    });

    const installLock = new AwaitLock();

    return async (name) => {
      await installLock.acquireAsync();
      await fixupPackageJson();

      try {
        logger.info(`installing package for extension "${name}"`);
        await forkNpm(...baseNpmInstallArgs, name);
        logger.info(`installed package for extension "${name}"`);
      } finally {
        installLock.release();
      }
    };
  },
});

export default installExtensionInjectable;
