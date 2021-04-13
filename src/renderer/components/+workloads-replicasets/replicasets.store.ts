import { observable } from "mobx";
import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { Deployment, ReplicaSet, replicaSetApi, getMetricsForReplicaSets } from "../../api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../api/api-manager";
import { IPodMetrics, PodStatus } from "../../api/endpoints/pods.api";

@autobind()
export class ReplicaSetStore extends KubeObjectStore<ReplicaSet> {
  api = replicaSetApi;
  @observable metrics: IPodMetrics = null;

  async loadMetrics(replicaSet: ReplicaSet) {
    this.metrics = await getMetricsForReplicaSets([replicaSet], replicaSet.getNs(), "");
  }

  getChildPods(replicaSet: ReplicaSet) {
    return podsStore.getPodsByOwnerId(replicaSet.getId());
  }

  getStatuses(replicaSets: ReplicaSet[]) {
    const status = { failed: 0, pending: 0, running: 0 };

    replicaSets.forEach(replicaSet => {
      const pods = this.getChildPods(replicaSet);

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

  getReplicaSetsByOwner(deployment: Deployment) {
    return this.items.filter(replicaSet =>
      !!replicaSet.getOwnerRefs().find(owner => owner.uid === deployment.getId())
    );
  }

  reset() {
    this.metrics = null;
  }
}

export const replicaSetStore = new ReplicaSetStore();
apiManager.registerStore(replicaSetStore);
