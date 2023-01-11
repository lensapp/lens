/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { Minimap } from "./minimap";

const minimapPreferenceBlockInjectable = getInjectable({
  id: "minimap-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "minimap",
    parentId: "editor-page",
    orderNumber: 10,
    Component: Minimap,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default minimapPreferenceBlockInjectable;
