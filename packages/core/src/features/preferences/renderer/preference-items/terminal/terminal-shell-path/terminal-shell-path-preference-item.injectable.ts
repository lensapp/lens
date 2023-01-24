/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { TerminalShellPath } from "./terminal-shell-path";

const terminalShellPathPreferenceItemInjectable = getInjectable({
  id: "terminal-shell-path-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "terminal-shell-path",
    parentId: "terminal-page",
    orderNumber: 10,
    Component: TerminalShellPath,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default terminalShellPathPreferenceItemInjectable;
