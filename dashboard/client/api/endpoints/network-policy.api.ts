import { KubeObject } from "../kube-object";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";

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

@autobind()
export class NetworkPolicy extends KubeObject {
  static kind = "NetworkPolicy"

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
  }

  getMatchLabels(): string[] {
    if (!this.spec.podSelector || !this.spec.podSelector.matchLabels) return [];
    return Object
      .entries(this.spec.podSelector.matchLabels)
      .map(data => data.join(":"))
  }

  getTypes(): string[] {
    if (!this.spec.policyTypes) return [];
    return this.spec.policyTypes;
  }
}

export const networkPolicyApi = new KubeApi({
  kind: NetworkPolicy.kind,
  apiBase: "/apis/networking.k8s.io/v1/networkpolicies",
  isNamespaced: true,
  objectConstructor: NetworkPolicy,
});
