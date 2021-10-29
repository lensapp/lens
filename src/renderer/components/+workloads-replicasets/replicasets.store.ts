/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { makeObservable } from "mobx";

import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { Deployment, ReplicaSet, replicaSetApi } from "../../../common/k8s-api/endpoints";
import { PodStatus } from "../../../common/k8s-api/endpoints/pods.api";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";

export class ReplicaSetStore extends KubeObjectStore<ReplicaSet> {
  api = replicaSetApi;

  constructor() {
    super();

    makeObservable(this);
    autoBind(this);
  }

  getChildPods(replicaSet: ReplicaSet) {
    return podsStore.getPodsByOwnerId(replicaSet.getId());
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

export const replicaSetStore = new ReplicaSetStore();
apiManager.registerStore(replicaSetStore);
