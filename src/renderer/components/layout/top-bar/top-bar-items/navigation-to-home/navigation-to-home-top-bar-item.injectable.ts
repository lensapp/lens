/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { NavigationToHome } from "./navigation-to-home";
import { topBarItemOnLeftSideInjectionToken } from "../top-bar-item-injection-token";

const navigationToHomeTopBarItemInjectable = getInjectable({
  id: "navigation-to-home-top-bar-item",

  instantiate: () => ({
    id: "navigation-to-home",
    isShown: computed(() => true),
    orderNumber: 20,
    Component: NavigationToHome,
  }),

  injectionToken: topBarItemOnLeftSideInjectionToken,
});

export default navigationToHomeTopBarItemInjectable;
