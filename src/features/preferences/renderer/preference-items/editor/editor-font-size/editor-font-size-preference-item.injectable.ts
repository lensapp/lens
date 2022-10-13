/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { EditorFontSize } from "./editor-font-size";

const editorFontSizePreferenceItemInjectable = getInjectable({
  id: "editor-font-size-preference-item",

  instantiate: () => ({
    kind: "item" as const,
    id: "editor-font-size",
    parentId: "editor-page",
    orderNumber: 40,
    Component: EditorFontSize,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default editorFontSizePreferenceItemInjectable;
