import { observable } from "mobx";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { IngressMetrics, Ingress, ingressApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";

@autobind()
export class IngressStore extends KubeObjectStore<Ingress> {
  api = ingressApi;
  @observable metrics: IngressMetrics = null;

  async loadMetrics(ingress: Ingress): Promise<void> {
    this.metrics = await this.api.getMetrics(ingress.getName(), ingress.getNs());
  }

  reset(): void {
    this.metrics = null;
  }
}

export const ingressStore = new IngressStore();
apiManager.registerStore(ingressApi, ingressStore);
