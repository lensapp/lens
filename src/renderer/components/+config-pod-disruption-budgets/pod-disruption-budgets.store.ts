import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { PodDisruptionBudget, pdbApi } from "../../api/endpoints/poddisruptionbudget.api";
import { apiManager } from "../../api/api-manager";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { Remove, Update } from "@material-ui/icons";
import { editResourceTab } from "../dock/edit-resource.store";

@autobind()
export class PodDisruptionBudgetsStore extends KubeObjectStore<PodDisruptionBudget> {
  api = pdbApi;
}

export const podDisruptionBudgetsStore = new PodDisruptionBudgetsStore();
apiManager.registerStore(podDisruptionBudgetsStore);

addLensKubeObjectMenuItem({
  Object: PodDisruptionBudget,
  Icon: Remove,
  onClick: object => podDisruptionBudgetsStore.remove(object),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: PodDisruptionBudget,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});
