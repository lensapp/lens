/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";

const kubectlGroupPreferenceItemInjectable = getInjectable({
  id: "kubectl-group-preference-item",

  instantiate: () => ({
    kind: "group" as const,
    id: "kubectl",
    parentId: "kubernetes-page",
    orderNumber: 10,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default kubectlGroupPreferenceItemInjectable;
