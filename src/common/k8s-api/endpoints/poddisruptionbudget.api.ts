/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface PodDisruptionBudgetSpec {
  minAvailable: string;
  maxUnavailable: string;
  selector: LabelSelector;
}

export interface PodDisruptionBudgetStatus {
  currentHealthy: number;
  desiredHealthy: number;
  disruptionsAllowed: number;
  expectedPods: number;
}

export class PodDisruptionBudget extends KubeObject<PodDisruptionBudgetStatus, PodDisruptionBudgetSpec, "namespace-scoped"> {
  static readonly kind = "PodDisruptionBudget";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/policy/v1beta1/poddisruptionbudgets";

  getSelectors() {
    return KubeObject.stringifyLabels(this.spec.selector.matchLabels);
  }

  getMinAvailable() {
    return this.spec.minAvailable || "N/A";
  }

  getMaxUnavailable() {
    return this.spec.maxUnavailable || "N/A";
  }

  getCurrentHealthy() {
    return this.status?.currentHealthy ?? 0;
  }

  getDesiredHealthy() {
    return this.status?.desiredHealthy ?? 0;
  }
}

export class PodDisruptionBudgetApi extends KubeApi<PodDisruptionBudget> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      objectConstructor: PodDisruptionBudget,
      ...opts,
    });
  }
}

export const podDisruptionBudgetApi = isClusterPageContext()
  ? new PodDisruptionBudgetApi()
  : undefined as never;
