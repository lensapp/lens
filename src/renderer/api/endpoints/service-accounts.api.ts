import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

@autobind()
export class ServiceAccount extends KubeObject {
  static kind = "ServiceAccount";

  secrets?: {
    name: string;
  }[]
  imagePullSecrets?: {
    name: string;
  }[]

  getSecrets() {
    return this.secrets || [];
  }

  getImagePullSecrets() {
    return this.imagePullSecrets || [];
  }
}

export const serviceAccountsApi = new KubeApi<ServiceAccount>({
  kind: ServiceAccount.kind,
  apiBase: "/api/v1/serviceaccounts",
  isNamespaced: true,
  objectConstructor: ServiceAccount,
});
