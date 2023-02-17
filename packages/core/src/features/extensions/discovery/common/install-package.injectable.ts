/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import AwaitLock from "await-lock";
import { once } from "lodash";
import type { PackageJson } from "type-fest";
import directoryForUserDataInjectable from "../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import readJsonFileInjectable from "../../../../common/fs/read-json-file.injectable";
import writeJsonFileInjectable from "../../../../common/fs/write-json-file.injectable";
import prefixedLoggerInjectable from "../../../../common/logger/prefixed-logger.injectable";
import joinPathsInjectable from "../../../../common/path/join-paths.injectable";
import { isErrnoException } from "../../../../common/utils";
import execNpmInjectable from "./exec-npm.injectable";

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

export type InstallExtensionPackage = (name: string) => Promise<void>;

const installExtensionPackageInjectable = getInjectable({
  id: "install-extension-package",
  instantiate: (di): InstallExtensionPackage => {
    const logger = di.inject(prefixedLoggerInjectable, "EXTENSION-INSTALLER");
    const execNpm = di.inject(execNpmInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const readJsonFile = di.inject(readJsonFileInjectable);
    const writeJsonFile = di.inject(writeJsonFileInjectable);

    const installLock = new AwaitLock();
    const packageJsonPath = joinPaths(directoryForUserData, "package.json");

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

    return async (name) => {
      await installLock.acquireAsync();

      logger.info(`Installing "${name}"`);

      await fixupPackageJson();

      const result = await execNpm(...baseNpmInstallArgs, name);

      if (!result.callWasSuccessful) {
        logger.warn(`Failed to install "${name}"`, result.error);
      }

      installLock.release();
    };
  },
});

export default installExtensionPackageInjectable;
