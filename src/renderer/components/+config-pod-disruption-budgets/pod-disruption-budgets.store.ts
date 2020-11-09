import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { PodDisruptionBudget, pdbApi } from "../../api/endpoints/poddisruptionbudget.api";
import { apiManager } from "../../api/api-manager";

@autobind()
export class PodDisruptionBudgetsStore extends KubeObjectStore<PodDisruptionBudget> {
  api = pdbApi
}

export const podDisruptionBudgetsStore = new PodDisruptionBudgetsStore();
apiManager.registerStore(podDisruptionBudgetsStore);
