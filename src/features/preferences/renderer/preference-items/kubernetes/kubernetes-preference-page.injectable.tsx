/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { PreferencePageComponent } from "../../preference-page-component";
import { HorizontalLine } from "../../../../../renderer/components/horizontal-line/horizontal-line";
import React from "react";
import type { PreferenceItemComponent, PreferencePage } from "@lensapp/preferences";
import { preferenceItemInjectionToken } from "@lensapp/preferences";

const KubernetesPage: PreferenceItemComponent<PreferencePage> = ({ children, item }) => (
  <PreferencePageComponent title="Kubernetes" id={item.id}>
    {children}
  </PreferencePageComponent>
);

const kubernetesPreferencePageInjectable = getInjectable({
  id: "kubernetes-preference-page",

  instantiate: () => ({
    kind: "page" as const,
    id: "kubernetes-page",
    parentId: "kubernetes-tab",
    Component: KubernetesPage,
    childSeparator: () => <HorizontalLine />,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default kubernetesPreferencePageInjectable;
