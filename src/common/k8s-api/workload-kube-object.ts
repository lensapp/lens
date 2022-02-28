/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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

export interface Affinity<T> {
  requiredDuringSchedulingIgnoredDuringExecution?: T[];
  preferredDuringSchedulingIgnoredDuringExecution?: T[];
}

export interface IMatchExpression {
  key: string;
  operator: string;
  values: string[];
}

export interface INodeAffinity {
  nodeSelectorTerms?: {
    matchExpressions: IMatchExpression[];
  }[];
  weight: number;
  preference: {
    matchExpressions: IMatchExpression[];
  };
}

export interface IPodAffinity {
  labelSelector: {
    matchExpressions: IMatchExpression[];
  };
  topologyKey: string;
}

export interface IAffinity {
  nodeAffinity?: Affinity<INodeAffinity>;
  podAffinity?: Affinity<IPodAffinity>;
  podAntiAffinity?: Affinity<IPodAffinity>;
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
