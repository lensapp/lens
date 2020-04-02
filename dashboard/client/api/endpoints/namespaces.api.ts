import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";
import { autobind } from "../../utils";

export enum NamespaceStatus {
  ACTIVE = "Active",
  TERMINATING = "Terminating",
}

@autobind()
export class Namespace extends KubeObject {
  static kind = "Namespace";

  status?: {
    phase: string;
  }

  getStatus() {
    return this.status ? this.status.phase : "-";
  }
}

export const namespacesApi = new KubeApi({
  kind: Namespace.kind,
  apiBase: "/api/v1/namespaces",
  isNamespaced: false,
  objectConstructor: Namespace,
});
