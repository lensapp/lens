import { LensRendererExtension, K8sApi } from "@k8slens/extensions";
import { resolveStatus, resolveStatusForCronJobs, resolveStatusForPods } from "./src/resolver";

export default class EventResourceStatusRendererExtension extends LensRendererExtension {
  kubeObjectStatusTexts = [
    {
      kind: "Pod",
      apiVersions: ["v1"],
      resolve: (pod: K8sApi.Pod) => resolveStatusForPods(pod)
    },
    {
      kind: "ReplicaSet",
      apiVersions: ["v1"],
      resolve: (replicaSet: K8sApi.ReplicaSet) => resolveStatus(replicaSet)
    },
    {
      kind: "Deployment",
      apiVersions: ["apps/v1"],
      resolve: (deployment: K8sApi.Deployment) => resolveStatus(deployment)
    },
    {
      kind: "StatefulSet",
      apiVersions: ["apps/v1"],
      resolve: (statefulSet: K8sApi.StatefulSet) => resolveStatus(statefulSet)
    },
    {
      kind: "DaemonSet",
      apiVersions: ["apps/v1"],
      resolve: (daemonSet: K8sApi.DaemonSet) => resolveStatus(daemonSet)
    },
    {
      kind: "Job",
      apiVersions: ["batch/v1"],
      resolve: (job: K8sApi.Job) => resolveStatus(job)
    },
    {
      kind: "CronJob",
      apiVersions: ["batch/v1"],
      resolve: (cronJob: K8sApi.CronJob) => resolveStatusForCronJobs(cronJob)
    },
  ]
}
