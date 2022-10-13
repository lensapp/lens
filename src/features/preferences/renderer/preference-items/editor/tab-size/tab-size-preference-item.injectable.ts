/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { TabSize } from "./tab-size";

const tabSizePreferenceItemInjectable = getInjectable({
  id: "tab-size-preference-item",

  instantiate: () => ({
    kind: "item" as const,
    id: "tab-size",
    parentId: "editor-page",
    orderNumber: 30,
    Component: TabSize,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default tabSizePreferenceItemInjectable;
