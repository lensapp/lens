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

interface NetworkPolicySpec {
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

@autobind()
export class NetworkPolicy extends KubeObject<NetworkPolicySpec> {
  static kind = "NetworkPolicy";
  static namespaced = true;
  static apiBase = "/apis/networking.k8s.io/v1/networkpolicies";

  getMatchLabels(): string[] {
    return Object
      .entries(this.spec?.podSelector?.matchLabels ?? {})
      .map(data => data.join(":"));
  }

  getTypes(): string[] {
    return this.spec?.policyTypes ?? [];
  }
}

export const networkPolicyApi = new KubeApi({
  objectConstructor: NetworkPolicy,
});
