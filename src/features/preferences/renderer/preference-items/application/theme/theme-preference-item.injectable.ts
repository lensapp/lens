/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { Theme } from "./theme";

const themePreferenceItemInjectable = getInjectable({
  id: "theme-preference-item",

  instantiate: () => ({
    kind: "item" as const,
    id: "theme",
    parentId: "application-page",
    orderNumber: 10,
    Component: Theme,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default themePreferenceItemInjectable;
