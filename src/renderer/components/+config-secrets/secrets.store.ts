import { KubeObjectStore } from "../../kube-object.store";
import { Secret, secretsApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";
import { autobind } from "../../../common/utils";

@autobind
export class SecretsStore extends KubeObjectStore<Secret> {
  api = secretsApi;
}

export const secretsStore = new SecretsStore();
apiManager.registerStore(secretsStore);
