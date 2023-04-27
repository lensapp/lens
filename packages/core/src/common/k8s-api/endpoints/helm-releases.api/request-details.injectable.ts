/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubeJsonApiData } from "@k8slens/kube-object";
import { urlBuilderFor } from "@k8slens/utilities";
import apiBaseInjectable from "../../api-base.injectable";

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

export type CallForHelmReleaseDetails = (name: string, namespace: string) => Promise<HelmReleaseDetails>;

const requestDetailsEndpoint = urlBuilderFor("/v2/releases/:namespace/:name");

const requestHelmReleaseDetailsInjectable = getInjectable({
  id: "call-for-helm-release-details",

  instantiate: (di): CallForHelmReleaseDetails => {
    const apiBase = di.inject(apiBaseInjectable);

    return (name, namespace) => apiBase.get(requestDetailsEndpoint.compile({ name, namespace }));
  },
});

export default requestHelmReleaseDetailsInjectable;
