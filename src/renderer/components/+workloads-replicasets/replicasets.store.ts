import { observable } from "mobx";
import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { Deployment, IPodMetrics, podsApi, ReplicaSet, replicaSetApi } from "../../api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../api/api-manager";

@autobind()
export class ReplicaSetStore extends KubeObjectStore<ReplicaSet> {
  api = replicaSetApi
  @observable metrics: IPodMetrics = null;

  async loadMetrics(replicaSet: ReplicaSet) {
    const pods = this.getChildPods(replicaSet);
    this.metrics = await podsApi.getMetrics(pods, replicaSet.getNs(), "");
  }

  getChildPods(replicaSet: ReplicaSet) {
    return podsStore.getPodsByOwner(replicaSet);
  }

  getReplicaSetsByOwner(deployment: Deployment) {
    return this.items.filter(replicaSet =>
      !!replicaSet.getOwnerRefs().find(owner => owner.uid === deployment.getId())
    )
  }

  reset() {
    this.metrics = null;
  }
}

export const replicaSetStore = new ReplicaSetStore();
apiManager.registerStore(replicaSetStore);
