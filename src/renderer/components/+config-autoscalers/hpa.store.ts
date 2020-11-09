import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { HorizontalPodAutoscaler, hpaApi } from "../../api/endpoints/hpa.api";
import { apiManager } from "../../api/api-manager";

@autobind()
export class HPAStore extends KubeObjectStore<HorizontalPodAutoscaler> {
  api = hpaApi
}

export const hpaStore = new HPAStore();
apiManager.registerStore(hpaStore);
