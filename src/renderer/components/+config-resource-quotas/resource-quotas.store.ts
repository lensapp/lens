import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { ResourceQuota, resourceQuotaApi } from "../../api/endpoints/resource-quota.api";
import { apiManager } from "../../api/api-manager";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { Remove, Update } from "@material-ui/icons";
import { editResourceTab } from "../dock/edit-resource.store";

@autobind()
export class ResourceQuotasStore extends KubeObjectStore<ResourceQuota> {
  api = resourceQuotaApi;
}

export const resourceQuotaStore = new ResourceQuotasStore();
apiManager.registerStore(resourceQuotaStore);

addLensKubeObjectMenuItem({
  Object: ResourceQuota,
  Icon: Remove,
  onClick: object => resourceQuotaStore.remove(object),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: ResourceQuota,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});
