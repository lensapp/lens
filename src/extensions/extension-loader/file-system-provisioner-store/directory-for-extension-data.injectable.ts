/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getAbsolutePathInjectable from "../../../common/path/get-absolute-path.injectable";

const directoryForExtensionDataInjectable = getInjectable({
  id: "directory-for-extension-data",

  instantiate: (di) => {
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return getAbsolutePath(directoryForUserData, "extension_data");
  },
});

export default directoryForExtensionDataInjectable;
