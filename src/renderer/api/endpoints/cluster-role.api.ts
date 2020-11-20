import { autobind } from "../../utils";
import { Role } from "./role.api";
import { KubeApi } from "../kube-api";

@autobind()
export class ClusterRole extends Role {
  static kind = "ClusterRole"
  static namespaced = false
  static apiBase = "/apis/rbac.authorization.k8s.io/v1/clusterroles"
}

export const clusterRoleApi = new KubeApi({
  objectConstructor: ClusterRole,
});
