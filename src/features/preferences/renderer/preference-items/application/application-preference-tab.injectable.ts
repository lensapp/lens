/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { preferenceItemInjectionToken } from "@lensapp/preferences";
import { getInjectable } from "@ogre-tools/injectable";

const applicationPreferenceTabInjectable = getInjectable({
  id: "application-preference-tab",

  instantiate: () => ({
    kind: "tab" as const,
    id: "application-tab",
    parentId: "general-tab-group" as const,
    pathId: "app",
    label: "App",
    orderNumber: 10,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default applicationPreferenceTabInjectable;
