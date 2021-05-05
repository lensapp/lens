import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";

export enum NamespaceStatus {
  ACTIVE = "Active",
  TERMINATING = "Terminating",
}

export class Namespace extends KubeObject {
  static kind = "Namespace";
  static namespaced = false;
  static apiBase = "/api/v1/namespaces";

  status?: {
    phase: string;
  };

  getStatus() {
    return this.status ? this.status.phase : "-";
  }
}

export const namespacesApi = new KubeApi({
  objectConstructor: Namespace,
});
