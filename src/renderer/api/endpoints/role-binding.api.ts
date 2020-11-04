import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export interface IRoleBindingSubject {
  kind: string;
  name: string;
  namespace?: string;
  apiGroup?: string;
}

@autobind()
export class RoleBinding extends KubeObject {
  static kind = "RoleBinding"
  static namespaced = true
  static apiBase = "/apis/rbac.authorization.k8s.io/v1/rolebindings"

  subjects?: IRoleBindingSubject[]
  roleRef: {
    kind: string;
    name: string;
    apiGroup?: string;
  }

  getSubjects() {
    return this.subjects || [];
  }

  getSubjectNames(): string {
    return this.getSubjects().map(subject => subject.name).join(", ")
  }
}

export const roleBindingApi = new KubeApi({
  objectConstructor: RoleBinding,
});
