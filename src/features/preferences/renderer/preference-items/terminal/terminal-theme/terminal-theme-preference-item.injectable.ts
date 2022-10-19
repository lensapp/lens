/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { TerminalTheme } from "./terminal-theme";

const terminalThemePreferenceItemInjectable = getInjectable({
  id: "terminal-theme",

  instantiate: () => ({
    kind: "block" as const,
    id: "terminal-theme",
    parentId: "terminal-page",
    orderNumber: 30,
    Component: TerminalTheme,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default terminalThemePreferenceItemInjectable;
