/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import moment from "moment";
import type { DerivedKubeApiOptions, KubeApiDependencies, NamespacedResourceDescriptor } from "../kube-api";
import { KubeApi } from "../kube-api";
import { DaemonSet } from "@k8slens/kube-object";

export class DaemonSetApi extends KubeApi<DaemonSet> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      ...opts ?? {},
      objectConstructor: DaemonSet,
    });
  }

  restart(params: NamespacedResourceDescriptor) {
    return this.patch(params, {
      spec: {
        template: {
          metadata: {
            annotations: { "kubectl.kubernetes.io/restartedAt" : moment.utc().format() },
          },
        },
      },
    }, "strategic");
  }
}
