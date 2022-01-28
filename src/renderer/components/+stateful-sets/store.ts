/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { makeObservable } from "mobx";

import type { PodStore } from "../+pods/store";
import { PodStatus, StatefulSet, StatefulSetApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";

export interface StatefulSetStoreDependencies {
  podStore: PodStore;
}

export class StatefulSetStore extends KubeObjectStore<StatefulSet> {
  constructor(public readonly api:StatefulSetApi, protected dependencies: StatefulSetStoreDependencies) {
    super();
    makeObservable(this);
    autoBind(this);
  }

  getChildPods(statefulSet: StatefulSet) {
    return this.dependencies.podStore.getPodsByOwnerId(statefulSet.getId());
  }

  getStatuses(statefulSets: StatefulSet[]) {
    const status = { running: 0, failed: 0, pending: 0 };

    statefulSets.forEach(statefulSet => {
      const pods = this.getChildPods(statefulSet);

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
}
