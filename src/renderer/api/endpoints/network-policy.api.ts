import { KubeObject } from "../kube-object";
import { autoBind } from "../../utils";
import { KubeApi } from "../kube-api";
import { KubeJsonApiData } from "../kube-json-api";

export interface IPolicyIpBlock {
  cidr: string;
  except?: string[];
}

export interface IPolicySelector {
  matchLabels: {
    [label: string]: string;
  };
}

export interface IPolicyIngress {
  from: {
    ipBlock?: IPolicyIpBlock;
    namespaceSelector?: IPolicySelector;
    podSelector?: IPolicySelector;
  }[];
  ports: {
    protocol: string;
    port: number;
  }[];
}

export interface IPolicyEgress {
  to: {
    ipBlock: IPolicyIpBlock;
  }[];
  ports: {
    protocol: string;
    port: number;
  }[];
}

export class NetworkPolicy extends KubeObject {
  static kind = "NetworkPolicy";
  static namespaced = true;
  static apiBase = "/apis/networking.k8s.io/v1/networkpolicies";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  spec: {
    podSelector: {
      matchLabels: {
        [label: string]: string;
        role: string;
      };
    };
    policyTypes: string[];
    ingress: IPolicyIngress[];
    egress: IPolicyEgress[];
  };

  getMatchLabels(): string[] {
    if (!this.spec.podSelector || !this.spec.podSelector.matchLabels) return [];

    return Object
      .entries(this.spec.podSelector.matchLabels)
      .map(data => data.join(":"));
  }

  getTypes(): string[] {
    if (!this.spec.policyTypes) return [];

    return this.spec.policyTypes;
  }
}

export const networkPolicyApi = new KubeApi({
  objectConstructor: NetworkPolicy,
});
