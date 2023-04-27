/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Cluster } from "@k8slens/kube-object";
import type { DerivedKubeApiOptions, KubeApiDependencies } from "../kube-api";
import { KubeApi } from "../kube-api";

export class ClusterApi extends KubeApi<Cluster> {
  /**
   * @deprecated This field is legacy and never used.
   */
  static kind = "Cluster";

  /**
   * @deprecated This field is legacy and never used.
   */
  static namespaced = true;

  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      ...opts ?? {},
      objectConstructor: Cluster,
    });
  }
}
