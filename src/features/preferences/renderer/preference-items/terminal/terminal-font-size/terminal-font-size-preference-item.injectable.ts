/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { TerminalFontSize } from "./terminal-font-size";

const terminalFontSizePreferenceItemInjectable = getInjectable({
  id: "terminal-font-size-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "terminal-font-size-preference-item",
    parentId: "terminal-page",
    orderNumber: 40,
    Component: TerminalFontSize,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default terminalFontSizePreferenceItemInjectable;
