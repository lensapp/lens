/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { makeObservable } from "mobx";

import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import type { DaemonSet, Pod } from "../../../common/k8s-api/endpoints";
import { daemonSetApi, PodStatus } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";

export class DaemonSetStore extends KubeObjectStore<DaemonSet> {
  api = daemonSetApi;

  constructor() {
    super();

    makeObservable(this);
    autoBind(this);
  }

  getChildPods(daemonSet: DaemonSet): Pod[] {
    return podsStore.getPodsByOwnerId(daemonSet.getId());
  }

  getStatuses(daemonSets?: DaemonSet[]) {
    const status = { running: 0, failed: 0, pending: 0 };

    daemonSets.forEach(daemonSet => {
      const pods = this.getChildPods(daemonSet);

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

export const daemonSetStore = new DaemonSetStore();
apiManager.registerStore(daemonSetStore);
