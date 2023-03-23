/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { clusterIconSettingsMenuInjectionToken } from "@k8slens/cluster-settings";

const clusterIconSettingsMenuClearItem = getInjectable({
  id: "cluster-icon-settings-menu-clear-item",

  instantiate: () => ({
    id: "clear-icon-menu-item",
    title: "Clear",
    disabled: (preferences) => !preferences.icon,
    onClick: (preferences) => {
      /**
       * NOTE: this needs to be `null` rather than `undefined` so that we can
       * tell the difference between it not being there and being cleared.
       */
      preferences.icon = null;
    },
  }),

  injectionToken: clusterIconSettingsMenuInjectionToken,
});

export default clusterIconSettingsMenuClearItem;
