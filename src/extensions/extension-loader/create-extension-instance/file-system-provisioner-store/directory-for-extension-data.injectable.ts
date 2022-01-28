/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import path from "path";
import directoryForUserDataInjectable from "../../../../common/app-paths/directory-for-user-data.injectable";

const directoryForExtensionDataInjectable = getInjectable({
  instantiate: (di) =>
    path.join(di.inject(directoryForUserDataInjectable), "extension_data"),

  lifecycle: lifecycleEnum.singleton,
});

export default directoryForExtensionDataInjectable;
