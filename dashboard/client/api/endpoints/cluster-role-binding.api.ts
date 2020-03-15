import { RoleBinding } from "./role-binding.api";
import { KubeApi } from "../kube-api";

export class ClusterRoleBinding extends RoleBinding {
  static kind = "ClusterRoleBinding"
}

export const clusterRoleBindingApi = new KubeApi({
  kind: ClusterRoleBinding.kind,
  apiBase: "/apis/rbac.authorization.k8s.io/v1/clusterrolebindings",
  isNamespaced: false,
  objectConstructor: ClusterRoleBinding,
});
