/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DerivedKubeApiOptions, KubeApiDependencies } from "../kube-api";
import { KubeApi } from "../kube-api";
import { HorizontalPodAutoscaler } from "@k8slens/kube-object";

export class HorizontalPodAutoscalerApi extends KubeApi<HorizontalPodAutoscaler> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      allowedUsableVersions: {
        autoscaling: [
          "v2",
          "v2beta2",
          "v2beta1",
          "v1",
        ],
      },
      ...opts ?? {},
      objectConstructor: HorizontalPodAutoscaler,
      checkPreferredVersion: true,
    });
  }
}
