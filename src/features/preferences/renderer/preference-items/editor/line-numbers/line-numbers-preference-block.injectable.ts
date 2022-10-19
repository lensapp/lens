/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { LineNumbers } from "./line-numbers";

const lineNumbersPreferenceBlockInjectable = getInjectable({
  id: "line-numbers-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "line-numbers",
    parentId: "editor-page",
    orderNumber: 20,
    Component: LineNumbers,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default lineNumbersPreferenceBlockInjectable;
