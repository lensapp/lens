import { observable } from "mobx";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { DaemonSet, daemonSetApi, IPodMetrics, Pod, podsApi, PodStatus } from "../../api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../api/api-manager";

@autobind()
export class DaemonSetStore extends KubeObjectStore<DaemonSet> {
  api = daemonSetApi

  @observable metrics: IPodMetrics = null;

  async loadMetrics(daemonSet: DaemonSet) {
    const pods = this.getChildPods(daemonSet);
    this.metrics = await podsApi.getMetrics(pods, daemonSet.getNs(), "");
  }

  getChildPods(daemonSet: DaemonSet): Pod[] {
    return podsStore.getPodsByOwner(daemonSet)
  }

  getStatuses(daemonSets?: DaemonSet[]) {
    const status = { failed: 0, pending: 0, running: 0 }
    daemonSets.forEach(daemonSet => {
      const pods = this.getChildPods(daemonSet)
      if (pods.some(pod => pod.getStatus() === PodStatus.FAILED)) {
        status.failed++
      }
      else if (pods.some(pod => pod.getStatus() === PodStatus.PENDING)) {
        status.pending++
      }
      else {
        status.running++
      }
    })
    return status
  }

  reset() {
    this.metrics = null;
  }
}

export const daemonSetStore = new DaemonSetStore();
apiManager.registerStore(daemonSetStore);
