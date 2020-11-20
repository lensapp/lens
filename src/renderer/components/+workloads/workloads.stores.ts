import { KubeObjectStore } from "../../kube-object.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { daemonSetStore } from "../+workloads-daemonsets/daemonsets.store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { cronJobStore } from "../+workloads-cronjobs/cronjob.store";
import { KubeResource } from "../../../common/rbac";

export const workloadStores: Partial<Record<KubeResource, KubeObjectStore>> = {
  "pods": podsStore,
  "deployments": deploymentStore,
  "daemonsets": daemonSetStore,
  "statefulsets": statefulSetStore,
  "jobs": jobStore,
  "cronjobs": cronJobStore,
}
