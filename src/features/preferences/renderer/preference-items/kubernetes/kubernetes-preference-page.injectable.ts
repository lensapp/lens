/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";
import { KubernetesPage } from "./kubernetes-page";
import { HorizontalLine } from "../../../../../renderer/components/+preferences/horizontal-line/horizontal-line";

const kubernetesPreferencePageInjectable = getInjectable({
  id: "kubernetes-preference-page",

  instantiate: () => ({
    kind: "page" as const,
    id: "kubernetes-page",
    parentId: "kubernetes-tab",
    orderNumber: 0,
    Component: KubernetesPage,
    childrenSeparator: HorizontalLine,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default kubernetesPreferencePageInjectable;
