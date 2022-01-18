/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
