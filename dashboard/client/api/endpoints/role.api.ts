import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export class Role extends KubeObject {
  static kind = "Role"

  rules: {
    verbs: string[];
    apiGroups: string[];
    resources: string[];
    resourceNames?: string[];
  }[]

  getRules() {
    return this.rules || [];
  }
}

export const roleApi = new KubeApi({
  kind: Role.kind,
  apiBase: "/apis/rbac.authorization.k8s.io/v1/roles",
  isNamespaced: true,
  objectConstructor: Role,
});
