/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { makeObservable } from "mobx";

import type { PodStore } from "../+pods/store";
import type { Deployment, ReplicaSet, ReplicaSetApi } from "../../../common/k8s-api/endpoints";
import { PodStatus } from "../../../common/k8s-api/endpoints/pod.api";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";

export interface ReplicaSetStoreDependencies {
  podStore: PodStore;
}

export class ReplicaSetStore extends KubeObjectStore<ReplicaSet> {
  constructor(public readonly api:ReplicaSetApi, protected dependencies: ReplicaSetStoreDependencies) {
    super();

    makeObservable(this);
    autoBind(this);
  }

  getChildPods(replicaSet: ReplicaSet) {
    return this.dependencies.podStore.getPodsByOwnerId(replicaSet.getId());
  }

  getStatuses(replicaSets: ReplicaSet[]) {
    const status = { running: 0, failed: 0, pending: 0 };

    replicaSets.forEach(replicaSet => {
      const pods = this.getChildPods(replicaSet);

      if (pods.some(pod => pod.getStatus() === PodStatus.FAILED)) {
        status.failed++;
      }
      else if (pods.some(pod => pod.getStatus() === PodStatus.PENDING)) {
        status.pending++;
      }
      else {
        status.running++;
      }
    });

    return status;
  }

  getReplicaSetsByOwner(deployment: Deployment) {
    return this.items.filter(replicaSet =>
      !!replicaSet.getOwnerRefs().find(owner => owner.uid === deployment.getId()),
    );
  }
}
