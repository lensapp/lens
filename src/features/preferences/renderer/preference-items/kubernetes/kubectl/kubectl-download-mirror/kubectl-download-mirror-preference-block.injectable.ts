/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { preferenceItemInjectionToken } from "@lensapp/preferences";
import { getInjectable } from "@ogre-tools/injectable";
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
