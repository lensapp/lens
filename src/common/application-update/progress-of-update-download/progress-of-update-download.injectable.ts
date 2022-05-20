/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createSyncBoxInjectable from "../../sync-box/create-sync-box.injectable";
import { syncBoxInjectionToken } from "../../sync-box/sync-box-injection-token";

const progressOfUpdateDownloadInjectable = getInjectable({
  id: "progress-of-update-download-state",

  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox<number>("progress-of-update-download");
  },

  injectionToken: syncBoxInjectionToken,
});

export default progressOfUpdateDownloadInjectable;
