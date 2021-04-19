import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { Endpoint, endpointApi } from "../../api/endpoints/endpoint.api";
import { apiManager } from "../../api/api-manager";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { Remove, Update } from "@material-ui/icons";
import { editResourceTab } from "../dock/edit-resource.store";

@autobind()
export class EndpointStore extends KubeObjectStore<Endpoint> {
  api = endpointApi;
}

export const endpointStore = new EndpointStore();
apiManager.registerStore(endpointStore);

addLensKubeObjectMenuItem({
  Object: Endpoint,
  Icon: Remove,
  onClick: object => endpointStore.remove(object),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: Endpoint,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});
