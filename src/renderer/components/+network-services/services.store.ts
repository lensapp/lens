import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { Service, serviceApi } from "../../api/endpoints/service.api";
import { apiManager } from "../../api/api-manager";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { Remove, Update } from "@material-ui/icons";
import { editResourceTab } from "../dock/edit-resource.store";

@autobind()
export class ServiceStore extends KubeObjectStore<Service> {
  api = serviceApi;
}

export const serviceStore = new ServiceStore();
apiManager.registerStore(serviceStore);

addLensKubeObjectMenuItem({
  Object: Service,
  Icon: Remove,
  onClick: object => serviceStore.remove(object),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: Service,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});
