import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { Service, serviceApi } from "../../api/endpoints/service.api";
import { apiManager } from "../../api/api-manager";

@autobind()
export class ServiceStore extends KubeObjectStore<Service> {
  api = serviceApi
}

export const serviceStore = new ServiceStore();
apiManager.registerStore(serviceStore);
