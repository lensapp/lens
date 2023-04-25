/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createSyncBoxInjectable from "../../../common/utils/sync-box/create-sync-box.injectable";
import type { UpdateChannel } from "./update-channels";
import type { SyncBox } from "../../../common/utils/sync-box/sync-box-injection-token";
import { syncBoxInjectionToken } from "../../../common/utils/sync-box/sync-box-injection-token";

export type DiscoveredUpdateVersion = SyncBox<{ version: string; updateChannel: UpdateChannel } | null>;

const discoveredUpdateVersionInjectable = getInjectable({
  id: "discovered-update-version",

  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox(
      "discovered-update-version",
      null,
    ) as DiscoveredUpdateVersion;
  },

  injectionToken: syncBoxInjectionToken,
});

export default discoveredUpdateVersionInjectable;
