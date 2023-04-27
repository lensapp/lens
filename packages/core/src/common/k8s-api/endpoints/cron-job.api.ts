/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { CronJob } from "@k8slens/kube-object";
import type { DerivedKubeApiOptions, KubeApiDependencies, NamespacedResourceDescriptor } from "../kube-api";
import { KubeApi } from "../kube-api";

export class CronJobApi extends KubeApi<CronJob> {
  constructor(deps: KubeApiDependencies, opts: DerivedKubeApiOptions) {
    super(deps, {
      ...opts,
      objectConstructor: CronJob,
    });
  }

  private requestSetSuspend(params: NamespacedResourceDescriptor, suspend: boolean) {
    return this.patch(params, {
      spec: {
        suspend,
      },
    }, "strategic");
  }

  suspend(params: NamespacedResourceDescriptor) {
    return this.requestSetSuspend(params, true);
  }

  resume(params: NamespacedResourceDescriptor) {
    return this.requestSetSuspend(params, false);
  }
}
