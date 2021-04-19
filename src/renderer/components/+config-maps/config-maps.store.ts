import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { ConfigMap, configMapApi } from "../../api/endpoints/configmap.api";
import { apiManager } from "../../api/api-manager";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { Remove, Update } from "@material-ui/icons";
import { editResourceTab } from "../dock/edit-resource.store";

@autobind()
export class ConfigMapsStore extends KubeObjectStore<ConfigMap> {
  api = configMapApi;
}

export const configMapsStore = new ConfigMapsStore();
apiManager.registerStore(configMapsStore);

addLensKubeObjectMenuItem({
  Object: ConfigMap,
  Icon: Remove,
  onClick: object => configMapsStore.remove(object),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: ConfigMap,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});
