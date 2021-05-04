import { KubeObjectStore } from "../../kube-object.store";
import { Service, serviceApi } from "../../api/endpoints/service.api";
import { apiManager } from "../../api/api-manager";
import { autobind } from "../../../common/utils";

@autobind
export class ServiceStore extends KubeObjectStore<Service> {
  api = serviceApi;
}

export const serviceStore = new ServiceStore();
apiManager.registerStore(serviceStore);
