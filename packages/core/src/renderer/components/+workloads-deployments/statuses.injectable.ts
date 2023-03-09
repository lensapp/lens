/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import type { Deployment, PodStatusPhase } from "../../../common/k8s-api/endpoints";
import { byLabels } from "../../../common/k8s-api/kube-object.store";
import { getOrInsert } from "../../utils";
import { foldPodStatusPhase } from "../../utils/fold-pod-status-phase";
import deploymentStoreInjectable from "./store.injectable";

const statusCountsForAllDeploymentsInSelectedNamespacesInjectable = getInjectable({
  id: "status-counts-for-all-deployments-in-selected-namespaces",
  instantiate: (di) => {
    const deploymentStore = di.inject(deploymentStoreInjectable);
    const podStore = di.inject(podStoreInjectable);

    return computed(() => {
      const statuses = { running: 0, failed: 0, pending: 0 };
      const podsByNamespace = new Map<string, { metadata: { labels: Partial<Record<string, string>> }; status: PodStatusPhase }[]>();

      for (const pod of podStore.items) {
        getOrInsert(podsByNamespace, pod.getNs(), []).push({
          metadata: {
            labels: JSON.parse(JSON.stringify(pod.metadata.labels ?? {})),
          },
          status: pod.getStatus(),
        });
      }

      const getChildPods = (deployment: Deployment) => {
        const pods = podsByNamespace.get(deployment.getNs()) ?? [];

        return pods.filter(byLabels(deployment.spec.template.metadata.labels));
      };

      for (const deployment of deploymentStore.contextItems) {
        const status = getChildPods(deployment)
          .map(pod => pod.status)
          .reduce(foldPodStatusPhase, "running");

        statuses[status]++;
      }

      return statuses;
    });
  },
});

export default statusCountsForAllDeploymentsInSelectedNamespacesInjectable;

