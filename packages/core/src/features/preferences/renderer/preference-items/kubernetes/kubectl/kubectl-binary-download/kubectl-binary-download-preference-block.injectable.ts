/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../../preference-item-injection-token";
import { KubectlBinaryDownload } from "./kubectl-binary-download";

const kubectlBinaryDownloadPreferenceBlockInjectable = getInjectable({
  id: "kubectl-binary-download-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "kubectl-binary-download",
    parentId: "kubectl",
    orderNumber: 10,
    Component: KubectlBinaryDownload,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default kubectlBinaryDownloadPreferenceBlockInjectable;
