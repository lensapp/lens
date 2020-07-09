import { observable } from "mobx";
import { Deployment, deploymentApi, PodMetricsData, podsApi, PodStatus, Pod } from "../../api/endpoints";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../api/api-manager";
import { Metrics } from "client/api/endpoints/metrics.api";
import { Dictionary } from "lodash";

@autobind()
export class DeploymentStore extends KubeObjectStore<Deployment> {
  api = deploymentApi
  @observable metrics: PodMetricsData = null;

  protected sortItems(items: Deployment[]): Deployment[] {
    return super.sortItems(items, [
      (item): number => item.getReplicas(),
    ], "desc");
  }

  async loadMetrics(deployment: Deployment): Promise<PodMetricsData<Metrics>> {
    const pods = this.getChildPods(deployment);
    const metrics = await podsApi.getMetrics(pods, deployment.getNs(), "");
    return this.metrics = metrics;
  }

  getStatuses(deployments?: Deployment[]): Dictionary<number> {
    const status = { failed: 0, pending: 0, running: 0 };
    deployments.forEach(deployment => {
      const pods = this.getChildPods(deployment);
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

  getChildPods(deployment: Deployment): Pod[] {
    return podsStore
      .getByLabel(deployment.getTemplateLabels())
      .filter(pod => pod.getNs() === deployment.getNs());
  }

  reset(): void {
    this.metrics = null;
  }
}

export const deploymentStore = new DeploymentStore();
apiManager.registerStore(deploymentApi, deploymentStore);
