import { autobind } from "../../utils";
import { Role } from "./role.api";
import { KubeApi } from "../kube-api";

@autobind()
export class ClusterRole extends Role {
  static kind = "ClusterRole"
}

export const clusterRoleApi = new KubeApi({
  kind: ClusterRole.kind,
  apiBase: "/apis/rbac.authorization.k8s.io/v1/clusterroles",
  isNamespaced: false,
  objectConstructor: ClusterRole,
});
