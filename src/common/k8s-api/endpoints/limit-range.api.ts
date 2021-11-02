/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
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
  type: string
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

let limitRangeApi: KubeApi<LimitRange>;

if (isClusterPageContext()) {
  limitRangeApi = new KubeApi<LimitRange>({
    objectConstructor: LimitRange,
  });
}

export {
  limitRangeApi,
};
