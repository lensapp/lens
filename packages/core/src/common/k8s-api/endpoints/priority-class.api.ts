/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { ClusterScopedMetadata, KubeObjectMetadata, KubeObjectScope } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { PreemptionPolicy } from "./types/preemption-policy";

export interface PriorityClassData extends KubeJsonApiData<KubeObjectMetadata<KubeObjectScope.Cluster>, void, void> {
  description?: string;
  globalDefault?: boolean;
  preemptionPolicy?: PreemptionPolicy;
  value: number;
}

export class PriorityClass extends KubeObject<
  ClusterScopedMetadata,
  void,
  void
> {
  static readonly kind = "PriorityClass";
  static readonly namespaced = false;
  static readonly apiBase = "/apis/scheduling.k8s.io/v1/priorityclasses";

  description?: string;
  globalDefault?: boolean;
  preemptionPolicy?: PreemptionPolicy;
  value?: number;

  constructor({ description, globalDefault, preemptionPolicy, value, ...rest }: PriorityClassData) {
    super(rest);
    this.description = description;
    this.globalDefault = globalDefault;
    this.preemptionPolicy = preemptionPolicy;
    this.value = value;
  }

  getDescription() {
    return this.description || "";
  }

  getGlobalDefault() {
    return (this.globalDefault || false).toString();
  }

  getPreemptionPolicy() {
    return this.preemptionPolicy || "PreemptLowerPriority";
  }

  getValue() {
    return this.value;
  }
}

export class PriorityClassApi extends KubeApi<PriorityClass, PriorityClassData> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      objectConstructor: PriorityClass,
      ...opts,
    });
  }
}
