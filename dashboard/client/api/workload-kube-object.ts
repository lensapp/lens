import get from "lodash/get";
import { IKubeObjectMetadata, KubeObject } from "./kube-object";

interface IToleration {
  key?: string;
  operator?: string;
  effect?: string;
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
  metadata: IKubeObjectMetadata & {
    ownerReferences?: {
      apiVersion: string;
      kind: string;
      name: string;
      uid: string;
      controller: boolean;
      blockOwnerDeletion: boolean;
    }[];
  }

  // fixme: add type
  spec: any;

  getOwnerRefs() {
    const refs = this.metadata.ownerReferences || [];
    return refs.map(ownerRef => ({
      ...ownerRef,
      namespace: this.getNs(),
    }))
  }

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
    return get(this, "spec.template.spec.tolerations", [])
  }

  getAffinity(): IAffinity {
    return get(this, "spec.template.spec.affinity")
  }

  getAffinityNumber() {
    const affinity = this.getAffinity()
    if (!affinity) return 0
    return Object.keys(affinity).length
  }
}