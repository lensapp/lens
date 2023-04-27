/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { Condition } from "../types/condition";

export interface V1Beta1PodDisruptionBudgetSpec {
  minAvailable: string;
  maxUnavailable: string;
  selector: LabelSelector;
}

export interface V1PodDisruptionBudgetSpec {
  maxUnavailable?: string | number;
  minAvailable?: string | number;
  selector?: LabelSelector;
}

export type PodDisruptionBudgetSpec = V1Beta1PodDisruptionBudgetSpec | V1PodDisruptionBudgetSpec;

export interface V1Beta1PodDisruptionBudgetStatus {
  currentHealthy: number;
  desiredHealthy: number;
  disruptionsAllowed: number;
  expectedPods: number;
}

export interface V1PodDisruptionBudgetStatus {
  conditions?: Condition[];
  currentHealthy: number;
  desiredHealthy: number;
  disruptedPods?: Partial<Record<string, string>>;
  disruptionsAllowed: number;
  expectedPods: number;
  observedGeneration?: number;
}

export type PodDisruptionBudgetStatus = V1Beta1PodDisruptionBudgetStatus | V1PodDisruptionBudgetStatus;

export class PodDisruptionBudget extends KubeObject<
  NamespaceScopedMetadata,
  PodDisruptionBudgetStatus,
  PodDisruptionBudgetSpec
> {
  static readonly kind = "PodDisruptionBudget";

  static readonly namespaced = true;

  static readonly apiBase = "/apis/policy/v1beta1/poddisruptionbudgets";

  getSelectors() {
    return KubeObject.stringifyLabels(this.spec.selector?.matchLabels);
  }

  getMinAvailable() {
    return this.spec.minAvailable ?? "N/A";
  }

  getMaxUnavailable() {
    return this.spec.maxUnavailable ?? "N/A";
  }

  getCurrentHealthy() {
    return this.status?.currentHealthy ?? 0;
  }

  getDesiredHealthy() {
    return this.status?.desiredHealthy ?? 0;
  }
}
