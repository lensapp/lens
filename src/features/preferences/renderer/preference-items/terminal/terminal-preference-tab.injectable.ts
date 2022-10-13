/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";

const terminalPreferenceTabInjectable = getInjectable({
  id: "terminal-preference-tab",

  instantiate: () => ({
    kind: "tab" as const,
    id: "terminal-tab",
    pathId: "terminal",
    parentId: "preference-tabs" as const,
    testId: "terminal-preferences-page",
    label: "Terminal",
    orderNumber: 20,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default terminalPreferenceTabInjectable;
