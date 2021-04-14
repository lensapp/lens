import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { WorkloadKubeObject, WorkloadSpec } from "../workload-kube-object";

interface PodDisruptionBudgetSpec extends WorkloadSpec {
  minAvailable: string;
  maxUnavailable: string;
}

interface PodDisruptionBudgetStatus {
  currentHealthy: number;
  desiredHealthy: number;
  disruptionsAllowed: number;
  expectedPods: number;
}

@autobind()
export class PodDisruptionBudget extends WorkloadKubeObject<PodDisruptionBudgetSpec, PodDisruptionBudgetStatus> {
  static kind = "PodDisruptionBudget";
  static namespaced = true;
  static apiBase = "/apis/policy/v1beta1/poddisruptionbudgets";

  getSelectors() {
    return KubeObject.stringifyLabels(this.spec?.selector?.matchLabels);
  }

  getMinAvailable() {
    return this.spec?.minAvailable || "N/A";
  }

  getMaxUnavailable() {
    return this.spec?.maxUnavailable || "N/A";
  }

  getCurrentHealthy() {
    return this.status?.currentHealthy ?? 0;
  }

  getDesiredHealthy() {
    return this.status?.desiredHealthy ?? 0;
  }

}

export const pdbApi = new KubeApi({
  objectConstructor: PodDisruptionBudget,
});
