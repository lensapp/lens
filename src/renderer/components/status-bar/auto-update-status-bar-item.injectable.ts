/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { AutoUpdateComponent } from "./auto-update-component";
import { statusBarItemInjectionToken } from "./status-bar-item-injection-token";

const autoUpdateStatusBarItemInjectable = getInjectable({
  id: "auto-update-status-bar-item",

  instantiate: () => ({
    component: AutoUpdateComponent,
    position: "left" as const,
    visible: computed(() => true),
  }),

  injectionToken: statusBarItemInjectionToken,
});

export default autoUpdateStatusBarItemInjectable;
