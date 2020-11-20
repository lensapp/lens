import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export interface IComponentStatusCondition {
  type: string;
  status: string;
  message: string;
}

export class ComponentStatus extends KubeObject {
  static kind = "ComponentStatus"
  static namespaced = false
  static apiBase = "/api/v1/componentstatuses"

  conditions: IComponentStatusCondition[]

  getTruthyConditions() {
    return this.conditions.filter(c => c.status === "True");
  }
}

export const componentStatusApi = new KubeApi({
  objectConstructor: ComponentStatus,
});
