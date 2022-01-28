/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import countBy from "lodash/countBy";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";
import type { Pod, PodApi } from "../../../common/k8s-api/endpoints";
import type { WorkloadKubeObject } from "../../../common/k8s-api/workload-kube-object";

export class PodStore extends KubeObjectStore<Pod> {
  constructor(public readonly api:PodApi) {
    super();
    autoBind(this);
  }

  /**
   * @deprecated This function has been removed and returns nothing
   */
  loadKubeMetrics(namespace?: string) {
    void namespace;
    console.warn("loadKubeMetrics has been removed and does nothing");

    return Promise.resolve();
  }

  getPodsByOwner(workload: WorkloadKubeObject | null | undefined): Pod[] {
    if (!workload) return [];

    return this.items.filter(pod => {
      const owners = pod.getOwnerRefs();

      return owners.find(owner => owner.uid === workload.getId());
    });
  }

  getPodsByOwnerId = (workloadId: string): Pod[] => {
    return this.items.filter(pod => pod.getOwnerRefs().find(owner => owner.uid === workloadId));
  };

  getPodsByNode(node: string) {
    return this.items.filter(pod => pod.spec.nodeName === node);
  }

  getStatuses(pods: Pod[]) {
    return countBy(pods.map(pod => pod.getStatus()).sort().reverse());
  }

  /**
   * @deprecated This function has been removed and returns nothing
   */
  getPodKubeMetrics(pod: Pod) {
    void pod;
    console.warn("getPodKubeMetrics has been removed and does nothing");

    return { cpu: 0, memory: 0 };
  }
}
