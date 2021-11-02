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

import { Renderer } from "@k8slens/extensions";
import { resolveStatus, resolveStatusForCronJobs, resolveStatusForPods } from "./src/resolver";

export default class EventResourceStatusRendererExtension extends Renderer.LensExtension {
  kubeObjectStatusTexts = [
    {
      kind: "Pod",
      apiVersions: ["v1"],
      resolve: (pod: Renderer.K8sApi.Pod) => resolveStatusForPods(pod),
    },
    {
      kind: "ReplicaSet",
      apiVersions: ["v1"],
      resolve: (replicaSet: Renderer.K8sApi.ReplicaSet) => resolveStatus(replicaSet),
    },
    {
      kind: "Deployment",
      apiVersions: ["apps/v1"],
      resolve: (deployment: Renderer.K8sApi.Deployment) => resolveStatus(deployment),
    },
    {
      kind: "StatefulSet",
      apiVersions: ["apps/v1"],
      resolve: (statefulSet: Renderer.K8sApi.StatefulSet) => resolveStatus(statefulSet),
    },
    {
      kind: "DaemonSet",
      apiVersions: ["apps/v1"],
      resolve: (daemonSet: Renderer.K8sApi.DaemonSet) => resolveStatus(daemonSet),
    },
    {
      kind: "Job",
      apiVersions: ["batch/v1"],
      resolve: (job: Renderer.K8sApi.Job) => resolveStatus(job),
    },
    {
      kind: "CronJob",
      apiVersions: ["batch/v1"],
      resolve: (cronJob: Renderer.K8sApi.CronJob) => resolveStatusForCronJobs(cronJob),
    },
  ];
}
