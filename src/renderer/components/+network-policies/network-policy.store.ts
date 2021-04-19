import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { NetworkPolicy, networkPolicyApi } from "../../api/endpoints/network-policy.api";
import { apiManager } from "../../api/api-manager";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { Remove, Update } from "@material-ui/icons";
import { editResourceTab } from "../dock/edit-resource.store";

@autobind()
export class NetworkPolicyStore extends KubeObjectStore<NetworkPolicy> {
  api = networkPolicyApi;
}

export const networkPolicyStore = new NetworkPolicyStore();
apiManager.registerStore(networkPolicyStore);

addLensKubeObjectMenuItem({
  Object: NetworkPolicy,
  Icon: Remove,
  onClick: object => networkPolicyStore.remove(object),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: NetworkPolicy,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});
