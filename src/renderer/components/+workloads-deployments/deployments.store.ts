/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { podStore } from "../+workloads-pods/legacy-store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import type { Deployment, DeploymentApi } from "../../../common/k8s-api/endpoints";
import { deploymentApi, PodStatusPhase } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { isClusterPageContext } from "../../utils";

export class DeploymentStore extends KubeObjectStore<Deployment, DeploymentApi> {
  protected sortItems(items: Deployment[]) {
    return super.sortItems(items, [
      item => item.getReplicas(),
    ], "desc");
  }

  getStatuses(deployments?: Deployment[]) {
    const status = { running: 0, failed: 0, pending: 0 };

    deployments?.forEach(deployment => {
      const pods = this.getChildPods(deployment);

      if (pods.some(pod => pod.getStatus() === PodStatusPhase.FAILED)) {
        status.failed++;
      }
      else if (pods.some(pod => pod.getStatus() === PodStatusPhase.PENDING)) {
        status.pending++;
      }
      else {
        status.running++;
      }
    });

    return status;
  }

  getChildPods(deployment: Deployment) {
    return podStore
      .getByLabel(deployment.getTemplateLabels())
      .filter(pod => pod.getNs() === deployment.getNs());
  }
}

export const deploymentStore = isClusterPageContext()
  ? new DeploymentStore(deploymentApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(deploymentStore);
}
