import { LensRendererExtension, K8sApi } from "@k8slens/extensions";
import { resolveStatus, resolveStatusForCronJobs, resolveStatusForPods } from "./src/resolver"

export default class EventResourceStatusRendererExtension extends LensRendererExtension {
  kubeObjectStatusTexts = [
    {
      kind: "Pod",
      apiVersions: ["v1"],
      resolve: (object: K8sApi.Pod) => resolveStatusForPods(object)
    },
    {
      kind: "ReplicaSet",
      apiVersions: ["v1"],
      resolve: (object: K8sApi.KubeObject) => resolveStatus(object)
    },
    {
      kind: "Deployment",
      apiVersions: ["apps/v1"],
      resolve: (object: K8sApi.KubeObject) => resolveStatus(object)
    },
    {
      kind: "StatefulSet",
      apiVersions: ["apps/v1"],
      resolve: (object: K8sApi.KubeObject) => resolveStatus(object)
    },
    {
      kind: "DaemonSet",
      apiVersions: ["apps/v1"],
      resolve: (object: K8sApi.KubeObject) => resolveStatus(object)
    },
    {
      kind: "Job",
      apiVersions: ["batch/v1"],
      resolve: (object: K8sApi.KubeObject) => resolveStatus(object)
    },
    {
      kind: "CronJob",
      apiVersions: ["batch/v1"],
      resolve: (cronJob: K8sApi.CronJob) => resolveStatusForCronJobs(cronJob)
    },
  ]
}
