import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { Secret, secretsApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { Remove, Update } from "@material-ui/icons";
import { editResourceTab } from "../dock/edit-resource.store";

@autobind()
export class SecretsStore extends KubeObjectStore<Secret> {
  api = secretsApi;
}

export const secretsStore = new SecretsStore();
apiManager.registerStore(secretsStore);

addLensKubeObjectMenuItem({
  Object: Secret,
  Icon: Remove,
  onClick: object => secretsStore.remove(object),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: Secret,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});
