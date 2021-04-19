import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { HorizontalPodAutoscaler, hpaApi } from "../../api/endpoints/hpa.api";
import { apiManager } from "../../api/api-manager";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { Remove, Update } from "@material-ui/icons";
import { editResourceTab } from "../dock/edit-resource.store";

@autobind()
export class HPAStore extends KubeObjectStore<HorizontalPodAutoscaler> {
  api = hpaApi;
}

export const hpaStore = new HPAStore();
apiManager.registerStore(hpaStore);

addLensKubeObjectMenuItem({
  Object: HorizontalPodAutoscaler,
  Icon: Remove,
  onClick: object => hpaStore.remove(object),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: HorizontalPodAutoscaler,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});
