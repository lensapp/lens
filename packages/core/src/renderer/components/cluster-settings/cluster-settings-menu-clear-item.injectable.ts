/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterPreferences } from "../../../common/cluster-types";
import type { ChangedClusterPreference } from "./cluster-settings-menu-injection-token";
import { clusterIconSettingsMenuInjectionToken } from "./cluster-settings-menu-injection-token";

const clusterIconSettingsMenuClearItem = getInjectable({
  id: "cluster-icon-settings-menu-clear-item",

  instantiate: () => ({
    id: "clear-icon-menu-item",
    title: "Clear",
    disabled: (preferences: ClusterPreferences) => !preferences.icon,
    onClick: () => {
      /**
       * NOTE: this needs to be `null` rather than `undefined` so that we can
       * tell the difference between it not being there and being cleared.
       */
      const data: ChangedClusterPreference = ["icon", null];

      return data;
    },
  }),

  injectionToken: clusterIconSettingsMenuInjectionToken,
});

export default clusterIconSettingsMenuClearItem;
