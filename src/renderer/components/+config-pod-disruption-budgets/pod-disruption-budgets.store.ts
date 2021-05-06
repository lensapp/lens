import { KubeObjectStore } from "../../kube-object.store";
import { pdbApi, PodDisruptionBudget } from "../../api/endpoints/poddisruptionbudget.api";
import { apiManager } from "../../api/api-manager";

export class PodDisruptionBudgetsStore extends KubeObjectStore<PodDisruptionBudget> {
  api = pdbApi;
}

export const podDisruptionBudgetsStore = new PodDisruptionBudgetsStore();
apiManager.registerStore(podDisruptionBudgetsStore);
