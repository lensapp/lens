import { RoleBinding } from "./role-binding.api";
import { KubeApi } from "../kube-api";

export class ClusterRoleBinding extends RoleBinding {
  static kind = "ClusterRoleBinding"
  static namespaced = false
  static apiBase = "/apis/rbac.authorization.k8s.io/v1/clusterrolebindings"
}

export const clusterRoleBindingApi = new KubeApi({
  objectConstructor: ClusterRoleBinding,
});
