import { observable } from "mobx";
import { Deployment, deploymentApi, IPodMetrics, podsApi, PodStatus } from "../../api/endpoints";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../api/api-manager";

@autobind()
export class DeploymentStore extends KubeObjectStore<Deployment> {
  api = deploymentApi
  @observable metrics: IPodMetrics = null;

  protected sortItems(items: Deployment[]) {
    return super.sortItems(items, [
      item => item.getReplicas(),
    ], "desc");
  }

  async loadMetrics(deployment: Deployment) {
    const pods = this.getChildPods(deployment);
    this.metrics = await podsApi.getMetrics(pods, deployment.getNs(), "");
  }

  getStatuses(deployments?: Deployment[]) {
    const status = { failed: 0, pending: 0, running: 0 }
    deployments.forEach(deployment => {
      const pods = this.getChildPods(deployment);
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

  getChildPods(deployment: Deployment) {
    return podsStore
      .getByLabel(deployment.getTemplateLabels())
      .filter(pod => pod.getNs() === deployment.getNs())
  }

  reset() {
    this.metrics = null;
  }
}

export const deploymentStore = new DeploymentStore();
apiManager.registerStore(deploymentStore);
