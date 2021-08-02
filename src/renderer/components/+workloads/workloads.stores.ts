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

import type { KubeObjectStore } from "../../kube-object.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { daemonSetStore } from "../+workloads-daemonsets/daemonsets.store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { cronJobStore } from "../+workloads-cronjobs/cronjob.store";
import type { KubeResource } from "../../../common/rbac";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import type { KubeObject } from "../../api/kube-object";

export const workloadStores = new Map<KubeResource, KubeObjectStore<KubeObject>>([
  ["pods", podsStore],
  ["deployments", deploymentStore],
  ["daemonsets", daemonSetStore],
  ["statefulsets", statefulSetStore],
  ["replicasets", replicaSetStore],
  ["jobs", jobStore],
  ["cronjobs", cronJobStore],
]);
