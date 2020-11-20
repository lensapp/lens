import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { ConfigMap, configMapApi } from "../../api/endpoints/configmap.api";
import { apiManager } from "../../api/api-manager";

@autobind()
export class ConfigMapsStore extends KubeObjectStore<ConfigMap> {
  api = configMapApi
}

export const configMapsStore = new ConfigMapsStore();
apiManager.registerStore(configMapsStore);
