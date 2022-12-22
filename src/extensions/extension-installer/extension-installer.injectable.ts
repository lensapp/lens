/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import pathToNpmCliInjectable from "../../common/app-paths/path-to-npm-cli.injectable";
import loggerInjectable from "../../common/logger.injectable";
import { ExtensionInstaller } from "./extension-installer";
import extensionPackageRootDirectoryInjectable from "./extension-package-root-directory/extension-package-root-directory.injectable";

const extensionInstallerInjectable = getInjectable({
  id: "extension-installer",

  instantiate: (di) => new ExtensionInstaller({
    extensionPackageRootDirectory: di.inject(extensionPackageRootDirectoryInjectable),
    logger: di.inject(loggerInjectable),
    pathToNpmCli: di.inject(pathToNpmCliInjectable),
  }),
});

export default extensionInstallerInjectable;
