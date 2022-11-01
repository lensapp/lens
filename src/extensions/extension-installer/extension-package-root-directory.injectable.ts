/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import directoryForUserDataInjectable, { initDirectoryForUserDataOnMainInjectable, initDirectoryForUserDataOnRendererInjectable } from "../../common/app-paths/directory-for-user-data.injectable";
import { createDependentInitializableState } from "../../common/initializable-state/create";

const {
  value: extensionPackageRootDirectoryInjectable,
  initializers: [
    initExtensionPackageRootDirectoryOnMainInjectable,
    initExtensionPackageRootDirectoryOnRendererInjectable,
  ],
} = createDependentInitializableState({
  id: "extension-package-root-directory",
  init: (di) => di.inject(directoryForUserDataInjectable).get(),
  initAfter: [
    initDirectoryForUserDataOnMainInjectable,
    initDirectoryForUserDataOnRendererInjectable,
  ],
});

export {
  initExtensionPackageRootDirectoryOnMainInjectable,
  initExtensionPackageRootDirectoryOnRendererInjectable,
};

export default extensionPackageRootDirectoryInjectable;
