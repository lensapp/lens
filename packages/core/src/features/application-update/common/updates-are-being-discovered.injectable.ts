/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createSyncBoxInjectable from "../../../common/utils/sync-box/create-sync-box.injectable";
import type { SyncBox } from "../../../common/utils/sync-box/sync-box-injection-token";
import { syncBoxInjectionToken } from "../../../common/utils/sync-box/sync-box-injection-token";

export type UpdatesAreBeingDiscovered = SyncBox<boolean>;

const updatesAreBeingDiscoveredInjectable = getInjectable({
  id: "updates-are-being-discovered",

  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox("updates-are-being-discovered", false);
  },

  injectionToken: syncBoxInjectionToken,
});

export default updatesAreBeingDiscoveredInjectable;
