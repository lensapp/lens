/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import directoryForUserDataInjectable, { initDirectoryForUserDataOnMainInjectable, initDirectoryForUserDataOnRendererInjectable } from "../../../common/app-paths/directory-for-user-data.injectable";
import { createDependentInitializableState } from "../../../common/initializable-state/create";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";

const {
  value: directoryForExtensionDataInjectable,
  initializers: [
    initDirectoryForExtensionDataOnMainInjectable,
    initDirectoryForExtensionDataOnRendererInjectable,
  ],
} = createDependentInitializableState({
  id: "directory-for-extension-data",
  init: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return joinPaths(directoryForUserData.get(), "extension_data");
  },
  initAfter: [
    initDirectoryForUserDataOnMainInjectable,
    initDirectoryForUserDataOnRendererInjectable,
  ],
});

export {
  initDirectoryForExtensionDataOnMainInjectable,
  initDirectoryForExtensionDataOnRendererInjectable,
};

export default directoryForExtensionDataInjectable;
