/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import topBarItemInjectionToken from "../top-bar-item-injection-token";
import { NavigationToHome } from "./navigation-to-home";

const navigationToHomeTopBarItemInjectable = getInjectable({
  id: "navigation-to-home-top-bar-item",

  instantiate: () => ({
    id: "navigation-to-home",
    isShown: computed(() => true),
    orderNumber: 20,
    Component: NavigationToHome,
  }),

  injectionToken: topBarItemInjectionToken,
});

export default navigationToHomeTopBarItemInjectable;
