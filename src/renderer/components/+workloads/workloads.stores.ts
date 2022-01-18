/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { daemonSetStore } from "../+workloads-daemonsets/daemonsets.store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { cronJobStore } from "../+workloads-cronjobs/cronjob.store";
import type { KubeResource } from "../../../common/rbac";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";

export const workloadStores = new Map<KubeResource, KubeObjectStore<KubeObject>>([
  ["pods", podsStore],
  ["deployments", deploymentStore],
  ["daemonsets", daemonSetStore],
  ["statefulsets", statefulSetStore],
  ["replicasets", replicaSetStore],
  ["jobs", jobStore],
  ["cronjobs", cronJobStore],
]);
