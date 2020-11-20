import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { Endpoint, endpointApi } from "../../api/endpoints/endpoint.api";
import { apiManager } from "../../api/api-manager";

@autobind()
export class EndpointStore extends KubeObjectStore<Endpoint> {
  api = endpointApi
}

export const endpointStore = new EndpointStore();
apiManager.registerStore(endpointStore);
