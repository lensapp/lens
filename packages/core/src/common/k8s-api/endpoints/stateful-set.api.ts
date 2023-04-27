/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import moment from "moment";

import type { DerivedKubeApiOptions, KubeApiDependencies, NamespacedResourceDescriptor } from "../kube-api";
import { KubeApi } from "../kube-api";
import { StatefulSet } from "@k8slens/kube-object";

export class StatefulSetApi extends KubeApi<StatefulSet> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      ...opts ?? {},
      objectConstructor: StatefulSet,
    });
  }

  protected getScaleApiUrl(params: NamespacedResourceDescriptor) {
    return `${this.formatUrlForNotListing(params)}/scale`;
  }

  async getReplicas(params: NamespacedResourceDescriptor): Promise<number> {
    const apiUrl = this.getScaleApiUrl(params);
    const { status = 0 } = await this.request.get(apiUrl) as { status?: number };

    return status;
  }

  scale(params: NamespacedResourceDescriptor, replicas: number) {
    return this.patch(params, {
      spec: {
        replicas,
      },
    }, "merge");
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
