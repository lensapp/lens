import { KubeObjectStore } from "../../kube-object.store";
import { Secret, secretsApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";

export class SecretsStore extends KubeObjectStore<Secret> {
  api = secretsApi;
}

export const secretsStore = new SecretsStore();
apiManager.registerStore(secretsStore);
