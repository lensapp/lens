/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoBind } from "../../utils";
import type { LabelSelector } from "../kube-object";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface PodDisruptionBudget {
  spec: {
    minAvailable: string;
    maxUnavailable: string;
    selector: LabelSelector;
  };
  status: {
    currentHealthy: number;
    desiredHealthy: number;
    disruptionsAllowed: number;
    expectedPods: number;
  };
}

export class PodDisruptionBudget extends KubeObject {
  static kind = "PodDisruptionBudget";
  static namespaced = true;
  static apiBase = "/apis/policy/v1beta1/poddisruptionbudgets";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
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

let pdbApi: KubeApi<PodDisruptionBudget>;

if (isClusterPageContext()) {
  pdbApi = new KubeApi({
    objectConstructor: PodDisruptionBudget,
  });
}

export {
  pdbApi,
};
