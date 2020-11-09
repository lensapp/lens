import { autobind } from "../../utils";
import { ServiceAccount, serviceAccountsApi } from "../../api/endpoints";
import { KubeObjectStore } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";

@autobind()
export class ServiceAccountsStore extends KubeObjectStore<ServiceAccount> {
  api = serviceAccountsApi

  protected async createItem(params: { name: string; namespace?: string }) {
    await super.createItem(params);
    return this.api.get(params); // hackfix: load freshly created account, cause it doesn't have "secrets" field yet
  }
}

export const serviceAccountsStore = new ServiceAccountsStore();
apiManager.registerStore(serviceAccountsStore);
