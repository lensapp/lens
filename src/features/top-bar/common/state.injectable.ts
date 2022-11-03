/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createSyncBoxInjectable from "../../../common/utils/sync-box/create-sync-box.injectable";
import { syncBoxInjectionToken } from "../../../common/utils/sync-box/sync-box-injection-token";

export interface TopBarState {
  prevEnabled: boolean;
  nextEnabled: boolean;
}

const topBarStateInjectable = getInjectable({
  id: "top-bar-state",
  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox<TopBarState>("top-bar-state", {
      prevEnabled: false,
      nextEnabled: false,
    });
  },
  injectionToken: syncBoxInjectionToken,
});

export default topBarStateInjectable;
