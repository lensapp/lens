/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DerivedKubeApiOptions, IgnoredKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { NamespaceScopedMetadata } from "../kube-object";
import { KubeObject } from "../kube-object";

export interface LeaseSpec {
  acquireTime?: string;
  holderIdentity: string;
  leaseDurationSeconds: number;
  leaseTransitions?: number;
  renewTime: string;
}

export class Lease extends KubeObject<
  NamespaceScopedMetadata,
  void,
  LeaseSpec
> {
  static readonly kind = "Lease";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/coordination.k8s.io/v1/leases";

  getAcquireTime(): string {
    return this.spec.acquireTime || "";
  }

  getHolderIdentity(): string {
    return this.spec.holderIdentity;
  }

  getLeaseDurationSeconds(): number {
    return this.spec.leaseDurationSeconds;
  }

  getLeaseTransitions(): number | undefined {
    return this.spec.leaseTransitions;
  }

  getRenewTime(): string {
    return this.spec.renewTime;
  }
}

export class LeaseApi extends KubeApi<Lease> {
  constructor(opts: DerivedKubeApiOptions & IgnoredKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: Lease,
    });
  }
}
