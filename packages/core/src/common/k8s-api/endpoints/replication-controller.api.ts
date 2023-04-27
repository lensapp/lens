/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DerivedKubeApiOptions, KubeApiDependencies, NamespacedResourceDescriptor } from "../kube-api";
import { KubeApi } from "../kube-api";
import { ReplicationController } from "@k8slens/kube-object";
import type { Scale } from "@k8slens/kube-object";

export class ReplicationControllerApi extends KubeApi<ReplicationController> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      ...opts ?? {},
      objectConstructor: ReplicationController,
    });
  }

  protected getScaleApiUrl(params: NamespacedResourceDescriptor) {
    return `${this.formatUrlForNotListing(params)}/scale`;
  }

  getScale(params: NamespacedResourceDescriptor): Promise<Scale> {
    return this.request.get(this.getScaleApiUrl(params));
  }

  scale(params: NamespacedResourceDescriptor, replicas: number): Promise<Scale> {
    return this.request.patch(this.getScaleApiUrl(params), {
      data: {
        metadata: params,
        spec: {
          replicas,
        },
      },
    }, {
      headers: {
        "content-type": "application/strategic-merge-patch+json",
      },
    });
  }
}
