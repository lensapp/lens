/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createSyncBoxInjectable from "../../utils/sync-box/create-sync-box.injectable";
import { syncBoxInjectionToken } from "../../utils/sync-box/sync-box-injection-token";

const updateWarningLevelInjectable = getInjectable({
  id: "update-warning-level",

  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox<"light" | "medium" | "high" | "">(
      "update-warning-level",
      "",
    );
  },

  injectionToken: syncBoxInjectionToken,
});

export default updateWarningLevelInjectable;
