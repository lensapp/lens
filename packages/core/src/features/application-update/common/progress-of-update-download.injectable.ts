/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createSyncBoxInjectable from "../../../common/utils/sync-box/create-sync-box.injectable";
import type { SyncBox } from "../../../common/utils/sync-box/sync-box-injection-token";
import { syncBoxInjectionToken } from "../../../common/utils/sync-box/sync-box-injection-token";

export interface ProgressOfDownload {
  percentage: number;
  failed?: string;
}

export type ProgressOfUpdateDownload = SyncBox<ProgressOfDownload>;

const progressOfUpdateDownloadInjectable = getInjectable({
  id: "progress-of-update-download-state",

  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox<ProgressOfDownload>("progress-of-update-download", { percentage: 0 });
  },

  injectionToken: syncBoxInjectionToken,
});

export default progressOfUpdateDownloadInjectable;
