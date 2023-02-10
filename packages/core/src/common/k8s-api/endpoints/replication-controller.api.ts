/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DerivedKubeApiOptions, KubeApiDependencies } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeObjectStatus, NamespaceScopedMetadata } from "../kube-object";
import { KubeObject } from "../kube-object";

export class ReplicationControllerApi extends KubeApi<ReplicationController> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      ...opts ?? {},
      objectConstructor: ReplicationController,
    });
  }
}

export interface ReplicationControllerSpec {
}

export interface ReplicationControllerStatus extends KubeObjectStatus {
}

export class ReplicationController extends KubeObject<
  NamespaceScopedMetadata,
  ReplicationControllerStatus,
  ReplicationControllerSpec
> {
  static kind = "ReplicationController";
  static namespaced = true;
  static apiBase = "/api/v1/replicationcontrollers";
}
