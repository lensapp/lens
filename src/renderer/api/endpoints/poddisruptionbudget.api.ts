import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

@autobind()
export class PodDisruptionBudget extends KubeObject {
  static kind = "PodDisruptionBudget";
  static namespaced = true;
  static apiBase = "/apis/policy/v1beta1/poddisruptionbudgets";

  spec: {
    minAvailable: string;
    maxUnavailable: string;
    selector: { matchLabels: { [app: string]: string } };
  }
  status: {
    currentHealthy: number
    desiredHealthy: number
    disruptionsAllowed: number
    expectedPods: number
  }

  getSelectors() {
    const selector = this.spec.selector;
    return KubeObject.stringifyLabels(selector ? selector.matchLabels : null);
  }

  getMinAvailable() {
    return this.spec.minAvailable || "N/A";
  }

  getMaxUnavailable() {
    return this.spec.maxUnavailable || "N/A";
  }

  getCurrentHealthy() {
    return this.status.currentHealthy;
  }

  getDesiredHealthy() {
    return this.status.desiredHealthy;
  }

}

export const pdbApi = new KubeApi({
  objectConstructor: PodDisruptionBudget,
});
