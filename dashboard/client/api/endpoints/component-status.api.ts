import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export interface IComponentStatusCondition {
  type: string;
  status: string;
  message: string;
}

export class ComponentStatus extends KubeObject {
  static kind = "ComponentStatus"

  conditions: IComponentStatusCondition[]

  getTruthyConditions() {
    return this.conditions.filter(c => c.status === "True");
  }
}

export const componentStatusApi = new KubeApi({
  kind: ComponentStatus.kind,
  apiBase: "/api/v1/componentstatuses",
  isNamespaced: false,
  objectConstructor: ComponentStatus,
});
