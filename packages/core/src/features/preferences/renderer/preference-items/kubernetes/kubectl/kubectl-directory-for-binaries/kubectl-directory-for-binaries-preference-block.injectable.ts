/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../../preference-item-injection-token";
import { KubectlDirectoryForBinaries } from "./kubectl-directory-for-binaries";

const kubectlDirectoryForBinariesPreferenceBlockInjectable = getInjectable({
  id: "kubectl-directory-for-binaries-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "kubectl-directory-for-binaries",
    parentId: "kubectl",
    orderNumber: 30,
    Component: KubectlDirectoryForBinaries,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default kubectlDirectoryForBinariesPreferenceBlockInjectable;
