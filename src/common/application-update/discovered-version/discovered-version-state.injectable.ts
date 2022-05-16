/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createSyncBoxInjectable from "../../sync-box/create-sync-box.injectable";

const discoveredVersionStateInjectable = getInjectable({
  id: "discovered-version-state",

  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox("discovered-version-state");
  },
});

export default discoveredVersionStateInjectable;
