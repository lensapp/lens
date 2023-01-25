/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../../preference-item-injection-token";
import { KubectlDownloadMirror } from "./kubectl-download-mirror";

const kubectlDownloadMirrorPreferenceBlockInjectable = getInjectable({
  id: "kubectl-download-mirror-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "kubectl-download-mirror",
    parentId: "kubectl",
    orderNumber: 20,
    Component: KubectlDownloadMirror,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default kubectlDownloadMirrorPreferenceBlockInjectable;
