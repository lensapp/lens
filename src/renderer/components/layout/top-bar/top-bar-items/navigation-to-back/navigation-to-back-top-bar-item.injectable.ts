/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { topBarItemOnLeftSideInjectionToken } from "../top-bar-item-injection-token";
import { NavigationToBack } from "./navigation-to-back";

const navigationToBackTopBarItemInjectable = getInjectable({
  id: "navigation-to-back-top-bar-item",

  instantiate: () => ({
    id: "navigation-to-back",
    isShown: computed(() => true),
    orderNumber: 30,
    Component: NavigationToBack,
  }),

  injectionToken: topBarItemOnLeftSideInjectionToken,
});

export default navigationToBackTopBarItemInjectable;
