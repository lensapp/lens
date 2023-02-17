/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createSyncBoxInjectable from "../../../../common/utils/sync-box/create-sync-box.injectable";
import { syncBoxInjectionToken } from "../../../../common/utils/sync-box/sync-box-injection-token";

const initialDiscoveryLoadCompletedInjectable = getInjectable({
  id: "initial-discovery-load-completed",
  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox("initial-extension-discovery-load-complete", false);
  },
  injectionToken: syncBoxInjectionToken,
});

export default initialDiscoveryLoadCompletedInjectable;
