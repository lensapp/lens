/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createSyncBoxInjectable from "../../utils/sync-box/create-sync-box.injectable";
import type { UpdateChannel } from "../update-channels";
import { syncBoxInjectionToken } from "../../utils/sync-box/sync-box-injection-token";

const discoveredUpdateVersionInjectable = getInjectable({
  id: "discovered-update-version",

  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox<
      | { version: string; updateChannel: UpdateChannel }
      | null
      >(
        "discovered-update-version",
        null,
      );
  },

  injectionToken: syncBoxInjectionToken,
});

export default discoveredUpdateVersionInjectable;
