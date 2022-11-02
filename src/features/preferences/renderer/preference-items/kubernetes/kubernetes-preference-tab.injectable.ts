/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";

const kubernetesPreferenceTabInjectable = getInjectable({
  id: "kubernetes-preference-tab",

  instantiate: () => ({
    kind: "tab" as const,
    id: "kubernetes-tab",
    parentId: "general-tab-group" as const,
    pathId: "kubernetes",
    label: "Kubernetes",
    orderNumber: 30,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default kubernetesPreferenceTabInjectable;
