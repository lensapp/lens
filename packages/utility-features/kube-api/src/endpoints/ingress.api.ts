/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Ingress } from "@k8slens/kube-object";
import type { DerivedKubeApiOptions, KubeApiDependencies } from "../kube-api";
import { KubeApi } from "../kube-api";

export class IngressApi extends KubeApi<Ingress> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      ...opts ?? {},
      objectConstructor: Ingress,
      // Add fallback for Kubernetes <1.19
      checkPreferredVersion: true,
      fallbackApiBases: ["/apis/extensions/v1beta1/ingresses"],
    });
  }
}
