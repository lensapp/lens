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
  kind: RoleBinding.kind,
  apiBase: "/apis/rbac.authorization.k8s.io/v1/rolebindings",
  isNamespaced: true,
  objectConstructor: RoleBinding,
});
