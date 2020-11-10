import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { Secret, secretsApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";

@autobind()
export class SecretsStore extends KubeObjectStore<Secret> {
  api = secretsApi
}

export const secretsStore = new SecretsStore();
apiManager.registerStore(secretsStore);
