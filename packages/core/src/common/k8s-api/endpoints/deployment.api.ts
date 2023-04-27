/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import moment from "moment";

import type { DerivedKubeApiOptions, KubeApiDependencies, NamespacedResourceDescriptor } from "../kube-api";
import { KubeApi } from "../kube-api";
import { Deployment } from "@k8slens/kube-object";
import { hasTypedProperty, isNumber, isObject } from "@k8slens/utilities";

export class DeploymentApi extends KubeApi<Deployment> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      ...opts ?? {},
      objectConstructor: Deployment,
    });
  }

  protected getScaleApiUrl(params: NamespacedResourceDescriptor) {
    return `${this.formatUrlForNotListing(params)}/scale`;
  }

  async getReplicas(params: NamespacedResourceDescriptor): Promise<number> {
    const { status } = await this.request.get(this.getScaleApiUrl(params));

    if (isObject(status) && hasTypedProperty(status, "replicas", isNumber)) {
      return status.replicas;
    }

    return 0;
  }

  scale(params: NamespacedResourceDescriptor, replicas: number) {
    return this.request.patch(this.getScaleApiUrl(params), {
      data: {
        spec: {
          replicas,
        },
      },
    },
    {
      headers: {
        "content-type": "application/merge-patch+json",
      },
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
