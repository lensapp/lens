import { autobind } from "../../utils";
import { ServiceAccount, serviceAccountsApi } from "../../api/endpoints";
import { KubeObjectStore } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { InsertDriveFile, Remove, Update } from "@material-ui/icons";
import { editResourceTab } from "../dock/edit-resource.store";
import { KubeConfigDialog } from "../kubeconfig-dialog";
import { apiBase } from "../../api";

@autobind()
export class ServiceAccountsStore extends KubeObjectStore<ServiceAccount> {
  api = serviceAccountsApi;

  protected async createItem(params: { name: string; namespace?: string }) {
    await super.createItem(params);

    return this.api.get(params); // hack-fix: load freshly created account, cause it doesn't have "secrets" field yet
  }
}

export const serviceAccountsStore = new ServiceAccountsStore();
apiManager.registerStore(serviceAccountsStore);

function openServiceAccountKubeConfig(account: ServiceAccount) {
  const accountName = account.getName();
  const namespace = account.getNs();

  // TODO: fix this
  KubeConfigDialog.open({
    title: "{accountName} kubeconfig",
    loader: () => apiBase.get(`/kubeconfig/service-account/${namespace}/${accountName}`)
  });
}

addLensKubeObjectMenuItem({
  Object: ServiceAccount,
  Icon: Remove,
  onClick: sa => serviceAccountsStore.remove(sa),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: ServiceAccount,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});

addLensKubeObjectMenuItem({
  Object: ServiceAccount,
  apiVersions: ["v1"],
  Icon: InsertDriveFile,
  onClick: object => openServiceAccountKubeConfig(object),
  text: "Kubeconfig File",
});
