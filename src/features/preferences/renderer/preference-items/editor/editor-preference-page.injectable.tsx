/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PreferenceItemComponent, PreferencePage } from "../preference-item-injection-token";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";
import { PreferencePageComponent } from "../../preference-page-component";
import React from "react";

const EditorPage: PreferenceItemComponent<PreferencePage> = ({ children, item }) => (
  <PreferencePageComponent title="Editor" id={item.id}>
    {children}
  </PreferencePageComponent>
);

const editorPreferencePageInjectable = getInjectable({
  id: "editor-preference-page",

  instantiate: () => ({
    kind: "page" as const,
    id: "editor-page",
    parentId: "editor-tab",
    Component: EditorPage,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default editorPreferencePageInjectable;
