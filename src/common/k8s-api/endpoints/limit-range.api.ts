/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import { BaseKubeApiOptions, KubeApi } from "../kube-api";
import { autoBind } from "../../utils";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export enum LimitType {
  CONTAINER = "Container",
  POD = "Pod",
  PVC = "PersistentVolumeClaim",
}

export enum Resource {
  MEMORY = "memory",
  CPU = "cpu",
  STORAGE = "storage",
  EPHEMERAL_STORAGE = "ephemeral-storage",
}

export enum LimitPart {
  MAX = "max",
  MIN = "min",
  DEFAULT = "default",
  DEFAULT_REQUEST = "defaultRequest",
  MAX_LIMIT_REQUEST_RATIO = "maxLimitRequestRatio",
}

type LimitRangeParts = Partial<Record<LimitPart, Record<string, string>>>;

export interface LimitRangeItem extends LimitRangeParts {
  type: string;
}

export interface LimitRange {
  spec: {
    limits: LimitRangeItem[];
  };
}

export class LimitRange extends KubeObject {
  static kind = "LimitRange";
  static namespaced = true;
  static apiBase = "/api/v1/limitranges";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getContainerLimits() {
    return this.spec.limits.filter(limit => limit.type === LimitType.CONTAINER);
  }

  getPodLimits() {
    return this.spec.limits.filter(limit => limit.type === LimitType.POD);
  }

  getPVCLimits() {
    return this.spec.limits.filter(limit => limit.type === LimitType.PVC);
  }
}

/**
 * The api type for {@link LimitRange}'s
 */
export class LimitRangeApi extends KubeApi<LimitRange> {
  constructor(params?: BaseKubeApiOptions) {
    super({
      ...(params ?? {}),
      objectConstructor: LimitRange,
    });
  }
}

/**
 * Only available within kubernetes cluster pages
 */
export const limitRangeApi = isClusterPageContext()
  ? new LimitRangeApi()
  : undefined;
