/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { ExtensionInstaller } from "./extension-installer";
import extensionPackageRootDirectoryInjectable from "./extension-package-root-directory/extension-package-root-directory.injectable";

const extensionInstallerInjectable = getInjectable({
  instantiate: (di) =>
    new ExtensionInstaller({
      extensionPackageRootDirectory: di.inject(
        extensionPackageRootDirectoryInjectable,
      ),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default extensionInstallerInjectable;
