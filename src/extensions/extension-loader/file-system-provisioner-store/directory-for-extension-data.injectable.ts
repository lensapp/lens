/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data.injectable";
import { createLazyInitializableState } from "../../../common/initializable-state/create-lazy";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";

const directoryForExtensionDataInjectable = createLazyInitializableState({
  id: "directory-for-extension-data",

  init: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return joinPaths(directoryForUserData.get(), "extension_data");
  },
});

export default directoryForExtensionDataInjectable;
