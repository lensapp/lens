/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createSyncBoxInjectable from "../../sync-box/create-sync-box.injectable";

const downloadingUpdateStateInjectable = getInjectable({
  id: "downloading-update-state",

  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox("downloading-update");
  },
});

export default downloadingUpdateStateInjectable;
