/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBase } from "../../../../../../../common/k8s-api";
import { endpoint } from "../../../../../../../common/k8s-api/endpoints/helm-releases.api";
import type { KubeJsonApiData } from "../../../../../../../common/k8s-api/kube-json-api";

export interface HelmReleaseDetails {
  resources: KubeJsonApiData[];
  name: string;
  namespace: string;
  version: string;
  config: string; // release values
  manifest: string;

  info: {
    deleted: string;
    description: string;
    first_deployed: string;
    last_deployed: string;
    notes: string;
    status: string;
  };
}

export type CallForHelmReleaseDetails = (
  name: string,
  namespace: string
) => Promise<HelmReleaseDetails>;

const callForHelmReleaseDetailsInjectable = getInjectable({
  id: "call-for-helm-release-details",

  instantiate: (): CallForHelmReleaseDetails => async (name, namespace) => {
    const path = endpoint({ name, namespace });

    return apiBase.get<HelmReleaseDetails>(path);
  },

  causesSideEffects: true,
});

export default callForHelmReleaseDetailsInjectable;
