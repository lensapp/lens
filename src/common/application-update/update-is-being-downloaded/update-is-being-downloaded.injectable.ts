/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createSyncBoxInjectable from "../../sync-box/create-sync-box.injectable";

const updateIsBeingDownloadedInjectable = getInjectable({
  id: "update-is-being-downloaded",

  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox<boolean>("update-is-being-downloaded");
  },
});

export default updateIsBeingDownloadedInjectable;
