/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeJsonApiData } from "../../common/k8s-api/kube-json-api";
import { buildURLPositional } from "../../common/utils/buildUrl";

export interface HelmReleaseDetails {
  resources: KubeJsonApiData[];
  name: string;
  namespace: string;
  version: string;
  config: string;  // release values
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

type EndpointParams = {}
  | { namespace: string }
  | { namespace: string; name: string };

export const helmReleasesUrl = buildURLPositional<EndpointParams>("/v2/releases/:namespace?/:name?");

