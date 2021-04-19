import { PodSecurityPolicy, pspApi } from "../../api/endpoints";
import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { Remove, Update } from "@material-ui/icons";
import { editResourceTab } from "../dock/edit-resource.store";

@autobind()
export class PodSecurityPoliciesStore extends KubeObjectStore<PodSecurityPolicy> {
  api = pspApi;
}

export const podSecurityPoliciesStore = new PodSecurityPoliciesStore();
apiManager.registerStore(podSecurityPoliciesStore);

addLensKubeObjectMenuItem({
  Object: PodSecurityPolicy,
  Icon: Remove,
  onClick: object => podSecurityPoliciesStore.remove(object),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: PodSecurityPolicy,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});
