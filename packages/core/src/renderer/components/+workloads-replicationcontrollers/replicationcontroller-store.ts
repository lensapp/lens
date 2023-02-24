/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type {
  ReplicationController,
  ReplicationControllerApi,
} from "../../../common/k8s-api/endpoints";
import type {
  KubeObjectStoreDependencies,
  KubeObjectStoreOptions,
} from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";

export interface ReplicationControllerStoreDependencies extends KubeObjectStoreDependencies {
}

export class ReplicationControllerStore extends KubeObjectStore<ReplicationController, ReplicationControllerApi> {
  constructor(protected readonly dependencies: ReplicationControllerStoreDependencies, api: ReplicationControllerApi, opts?: KubeObjectStoreOptions) {
    super(dependencies, api, opts);
  }
}
