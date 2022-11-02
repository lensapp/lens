/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { TerminalFontFamily } from "./terminal-font-family";

const terminalFontFamilyPreferenceItemInjectable = getInjectable({
  id: "terminal-font-family-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "terminal-font-family-preference-item",
    parentId: "terminal-page",
    orderNumber: 50,
    Component: TerminalFontFamily,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default terminalFontFamilyPreferenceItemInjectable;
