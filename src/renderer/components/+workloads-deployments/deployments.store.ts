/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { makeObservable } from "mobx";

import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import type { Deployment } from "../../../common/k8s-api/endpoints";
import { deploymentApi, PodStatus } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";

export class DeploymentStore extends KubeObjectStore<Deployment> {
  api = deploymentApi;

  constructor() {
    super();

    makeObservable(this);
    autoBind(this);
  }

  protected sortItems(items: Deployment[]) {
    return super.sortItems(items, [
      item => item.getReplicas(),
    ], "desc");
  }

  getStatuses(deployments?: Deployment[]) {
    const status = { running: 0, failed: 0, pending: 0 };

    deployments.forEach(deployment => {
      const pods = this.getChildPods(deployment);

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

  getChildPods(deployment: Deployment) {
    return podsStore
      .getByLabel(deployment.getTemplateLabels())
      .filter(pod => pod.getNs() === deployment.getNs());
  }
}

export const deploymentStore = new DeploymentStore();
apiManager.registerStore(deploymentStore);
