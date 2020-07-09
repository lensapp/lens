import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export interface ImagePullSecret {
  name: string;
}

export interface Secret {
  name: string;
}

@autobind()
export class ServiceAccount extends KubeObject {
  static kind = "ServiceAccount";

  secrets?: Secret[]
  imagePullSecrets?: ImagePullSecret[]

  getSecrets(): Secret[] {
    return this.secrets || [];
  }

  getImagePullSecrets(): ImagePullSecret[] {
    return this.imagePullSecrets || [];
  }
}

export const serviceAccountsApi = new KubeApi<ServiceAccount>({
  kind: ServiceAccount.kind,
  apiBase: "/api/v1/serviceaccounts",
  isNamespaced: true,
  objectConstructor: ServiceAccount,
});
