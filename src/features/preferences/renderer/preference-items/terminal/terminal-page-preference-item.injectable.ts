/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";
import { TerminalPage } from "./terminal-page";
import { HorizontalLine } from "../../../../../renderer/components/+preferences/horizontal-line/horizontal-line";

const terminalPagePreferenceItemInjectable = getInjectable({
  id: "terminal-preference-page",

  instantiate: () => ({
    kind: "page" as const,
    id: "terminal-page",
    parentId: "terminal-tab",
    orderNumber: 0,
    Component: TerminalPage,
    childrenSeparator: HorizontalLine,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default terminalPagePreferenceItemInjectable;
