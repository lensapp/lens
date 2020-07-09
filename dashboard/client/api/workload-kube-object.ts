import get from "lodash/get";
import { KubeObject } from "./kube-object";

interface Toleration {
  key?: string;
  operator?: string;
  effect?: string;
  tolerationSeconds?: number;
}

interface MatchExpression {
  key: string;
  operator: string;
  values: string[];
}

interface NodeAffinity {
  nodeSelectorTerms?: {
    matchExpressions: MatchExpression[];
  }[];
  weight: number;
  preference: {
    matchExpressions: MatchExpression[];
  };
}

interface PodAffinity {
  labelSelector: {
    matchExpressions: MatchExpression[];
  };
  topologyKey: string;
}

export interface Affinity {
  nodeAffinity?: {
    requiredDuringSchedulingIgnoredDuringExecution?: NodeAffinity[];
    preferredDuringSchedulingIgnoredDuringExecution?: NodeAffinity[];
  };
  podAffinity?: {
    requiredDuringSchedulingIgnoredDuringExecution?: PodAffinity[];
    preferredDuringSchedulingIgnoredDuringExecution?: PodAffinity[];
  };
  podAntiAffinity?: {
    requiredDuringSchedulingIgnoredDuringExecution?: PodAffinity[];
    preferredDuringSchedulingIgnoredDuringExecution?: PodAffinity[];
  };
}

export class WorkloadKubeObject extends KubeObject {

  // fixme: add type
  spec: any;

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

  getTolerations(): Toleration[] {
    return get(this, "spec.template.spec.tolerations", []);
  }

  getAffinity(): Affinity {
    return get(this, "spec.template.spec.affinity");
  }

  getAffinityNumber(): number {
    const affinity = this.getAffinity();
    if (!affinity) {
      return 0;
    }
    return Object.keys(affinity).length;
  }
}