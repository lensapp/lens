import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { KubeJsonApiData } from "../kube-json-api";

export interface IRoleBindingSubject {
  kind: string;
  name: string;
  namespace?: string;
  apiGroup?: string;
}

export class RoleBinding extends KubeObject {
  static kind = "RoleBinding";
  static namespaced = true;
  static apiBase = "/apis/rbac.authorization.k8s.io/v1/rolebindings";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  subjects?: IRoleBindingSubject[];
  roleRef: {
    kind: string;
    name: string;
    apiGroup?: string;
  };

  getSubjects() {
    return this.subjects || [];
  }

  getSubjectNames(): string {
    return this.getSubjects().map(subject => subject.name).join(", ");
  }
}

export const roleBindingApi = new KubeApi({
  objectConstructor: RoleBinding,
});
