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

import get from "lodash/get";
import { KubeObject } from "./kube-object";

export interface IToleration {
  key?: string;
  operator?: string;
  effect?: string;
  value?: string;
  tolerationSeconds?: number;
}

interface IMatchExpression {
  key: string;
  operator: string;
  values: string[];
}

interface INodeAffinity {
  nodeSelectorTerms?: {
    matchExpressions: IMatchExpression[];
  }[];
  weight: number;
  preference: {
    matchExpressions: IMatchExpression[];
  };
}

interface IPodAffinity {
  labelSelector: {
    matchExpressions: IMatchExpression[];
  };
  topologyKey: string;
}

export interface IAffinity {
  nodeAffinity?: {
    requiredDuringSchedulingIgnoredDuringExecution?: INodeAffinity[];
    preferredDuringSchedulingIgnoredDuringExecution?: INodeAffinity[];
  };
  podAffinity?: {
    requiredDuringSchedulingIgnoredDuringExecution?: IPodAffinity[];
    preferredDuringSchedulingIgnoredDuringExecution?: IPodAffinity[];
  };
  podAntiAffinity?: {
    requiredDuringSchedulingIgnoredDuringExecution?: IPodAffinity[];
    preferredDuringSchedulingIgnoredDuringExecution?: IPodAffinity[];
  };
}

export class WorkloadKubeObject extends KubeObject {
  getSelectors(): string[] {
    const selector = this.spec.selector;

    return KubeObject.stringifyLabels(selector ? selector.matchLabels : null);
  }

  getNodeSelectors(): string[] {
    const nodeSelector = get(this, "spec.template.spec.nodeSelector");

    return KubeObject.stringifyLabels(nodeSelector);
  }

  getTemplateLabels(): string[] {
    const labels = get(this, "spec.template.metadata.labels");

    return KubeObject.stringifyLabels(labels);
  }

  getTolerations(): IToleration[] {
    return get(this, "spec.template.spec.tolerations", []);
  }

  getAffinity(): IAffinity {
    return get(this, "spec.template.spec.affinity");
  }

  getAffinityNumber() {
    const affinity = this.getAffinity();

    if (!affinity) return 0;

    return Object.keys(affinity).length;
  }
}
