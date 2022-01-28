/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import path from "path";
import directoryForUserDataInjectable from "./directory-for-user-data.injectable";

const directoryForBinariesInjectable = getInjectable({
  instantiate: (di) =>
    path.join(di.inject(directoryForUserDataInjectable), "binaries"),

  lifecycle: lifecycleEnum.singleton,
});

export default directoryForBinariesInjectable;
