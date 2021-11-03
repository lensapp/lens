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

import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface PodDisruptionBudget {
  spec: {
    minAvailable: string;
    maxUnavailable: string;
    selector: { matchLabels: { [app: string]: string }};
  };
  status: {
    currentHealthy: number
    desiredHealthy: number
    disruptionsAllowed: number
    expectedPods: number
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
