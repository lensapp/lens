/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import directoryForUserDataInjectable from "../directory-for-user-data/directory-for-user-data.injectable";

const directoryForBinariesInjectable = getInjectable({
  id: "directory-for-binaries",

  instantiate: (di) =>
    path.join(di.inject(directoryForUserDataInjectable), "binaries"),
});

export default directoryForBinariesInjectable;
