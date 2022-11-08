/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { preferenceItemInjectionToken } from "@lensapp/preferences";
import { getInjectable } from "@ogre-tools/injectable";
import { Theme } from "./theme";

const themePreferenceBlockInjectable = getInjectable({
  id: "theme-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "theme",
    parentId: "application-page",
    orderNumber: 10,
    Component: Theme,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default themePreferenceBlockInjectable;
