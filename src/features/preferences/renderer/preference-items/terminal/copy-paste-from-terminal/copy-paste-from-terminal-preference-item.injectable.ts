/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { preferenceItemInjectionToken } from "@lensapp/preferences";
import { getInjectable } from "@ogre-tools/injectable";
import { CopyPasteFromTerminal } from "./copy-paste-from-terminal";

const copyPasteFromTerminalPreferenceItemInjectable = getInjectable({
  id: "copy-paste-from-terminal-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "copy-paste-from-terminal-preference-item",
    parentId: "terminal-page",
    orderNumber: 20,
    Component: CopyPasteFromTerminal,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default copyPasteFromTerminalPreferenceItemInjectable;
