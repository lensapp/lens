import { observable } from "mobx";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { IIngressMetrics, Ingress, ingressApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";

@autobind()
export class IngressStore extends KubeObjectStore<Ingress> {
  api = ingressApi;
  @observable metrics: IIngressMetrics = null;

  async loadMetrics(ingress: Ingress) {
    this.metrics = await this.api.getMetrics(ingress.getName(), ingress.getNs());
  }

  reset() {
    this.metrics = null;
  }
}

export const ingressStore = new IngressStore();
apiManager.registerStore(ingressStore);
