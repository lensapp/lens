import { observable } from "mobx";
import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { PodMetricsData, podsApi, PodStatus, StatefulSet, statefulSetApi, Pod } from "../../api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../api/api-manager";
import { Dictionary } from "lodash";

@autobind()
export class StatefulSetStore extends KubeObjectStore<StatefulSet> {
  api = statefulSetApi
  @observable metrics: PodMetricsData = null;

  async loadMetrics(statefulSet: StatefulSet): Promise<PodMetricsData> {
    const pods = this.getChildPods(statefulSet);
    const metrics = await podsApi.getMetrics(pods, statefulSet.getNs(), "");
    return this.metrics = metrics;
  }

  getChildPods(statefulSet: StatefulSet): Pod[] {
    return podsStore.getPodsByOwner(statefulSet);
  }

  getStatuses(statefulSets: StatefulSet[]): Dictionary<number> {
    const status = { failed: 0, pending: 0, running: 0 };
    statefulSets.forEach(statefulSet => {
      const pods = this.getChildPods(statefulSet);
      if (pods.some(pod => pod.getStatus() === PodStatus.FAILED)) {
        status.failed++;
      } else if (pods.some(pod => pod.getStatus() === PodStatus.PENDING)) {
        status.pending++;
      } else {
        status.running++;
      }
    });
    return status;
  }

  reset(): void {
    this.metrics = null;
  }
}

export const statefulSetStore = new StatefulSetStore();
apiManager.registerStore(statefulSetApi, statefulSetStore);
