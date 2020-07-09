import { observable } from "mobx";
import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { Deployment, PodMetricsData, podsApi, ReplicaSet, replicaSetApi, Pod } from "../../api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../api/api-manager";
import { Metrics } from "client/api/endpoints/metrics.api";

@autobind()
export class ReplicaSetStore extends KubeObjectStore<ReplicaSet> {
  api = replicaSetApi
  @observable metrics: PodMetricsData = null;

  loadMetrics(replicaSet: ReplicaSet): Promise<PodMetricsData<Metrics>> {
    const pods = this.getChildPods(replicaSet);
    return podsApi.getMetrics(pods, replicaSet.getNs(), "").then(metrics =>
      this.metrics = metrics
    );
  }

  getChildPods(replicaSet: ReplicaSet): Pod[] {
    return podsStore.getPodsByOwner(replicaSet);
  }

  getReplicaSetsByOwner(deployment: Deployment): ReplicaSet[] {
    return this.items.filter(replicaSet =>
      !!replicaSet.getOwnerRefs().find(owner => owner.uid === deployment.getId())
    );
  }

  reset(): void {
    this.metrics = null;
  }
}

export const replicaSetStore = new ReplicaSetStore();
apiManager.registerStore(replicaSetApi, replicaSetStore);
