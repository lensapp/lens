/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../../preference-item-injection-token";
import { KubectlPathToBinary } from "./kubectl-path-to-binary";

const kubectlPathToBinaryPreferenceBlockInjectable = getInjectable({
  id: "kubectl-path-to-binary-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "kubectl-path-to-binary",
    parentId: "kubectl",
    orderNumber: 40,
    Component: KubectlPathToBinary,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default kubectlPathToBinaryPreferenceBlockInjectable;
