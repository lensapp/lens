/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface IPolicyIpBlock {
  cidr: string;
  except?: string[];
}

/**
 * @deprecated Use `LabelSelector` instead
 */
export type IPolicySelector = LabelSelector;

export interface NetworkPolicyPort {
  /**
   * The protocol which network traffic must match.
   *
   * One of:
   * - `"TCP"`
   * - `"UDP"`
   * - `"SCTP"`
   *
   * @default "TCP"
   */
  protocol?: string;

  /**
   * The port on the given protocol. This can either be a numerical or named
   * port on a pod. If this field is not provided, this matches all port names and
   * numbers.
   *
   * If present, only traffic on the specified protocol AND port will be matched.
   */
  port?: number | string;

  /**
   * If set, indicates that the range of ports from port to endPort, inclusive,
   * should be allowed by the policy. This field cannot be defined if the port field
   * is not defined or if the port field is defined as a named (string) port.
   *
   * The endPort must be equal or greater than port.
   */
  endPort?: number;
}

export interface NetworkPolicyPeer {
  /**
   * IPBlock defines policy on a particular IPBlock. If this field is set then
   * neither of the other fields can be.
   */
  ipBlock?: IPolicyIpBlock;

  /**
   * Selects Namespaces using cluster-scoped labels. This field follows standard label
   * selector semantics; if present but empty, it selects all namespaces.
   *
   * If PodSelector is also set, then the NetworkPolicyPeer as a whole selects
   * the Pods matching PodSelector in the Namespaces selected by NamespaceSelector.
   *
   * Otherwise it selects all Pods in the Namespaces selected by NamespaceSelector.
   */
  namespaceSelector?: LabelSelector;

  /**
   * This is a label selector which selects Pods. This field follows standard label
   * selector semantics; if present but empty, it selects all pods.
   *
   * If NamespaceSelector is also set, then the NetworkPolicyPeer as a whole selects
   * the Pods matching PodSelector in the Namespaces selected by NamespaceSelector.
   *
   * Otherwise it selects the Pods matching PodSelector in the policy's own Namespace.
   */
  podSelector?: LabelSelector;
}

export interface IPolicyIngress {
  from?: NetworkPolicyPeer[];
  ports?: NetworkPolicyPort[];
}

export interface IPolicyEgress {
  to?: NetworkPolicyPeer[];
  ports?: NetworkPolicyPort[];
}

export type PolicyType = "Ingress" | "Egress";

export interface NetworkPolicySpec {
  podSelector: LabelSelector;
  policyTypes?: PolicyType[];
  ingress?: IPolicyIngress[];
  egress?: IPolicyEgress[];
}

export interface NetworkPolicy {
  spec: NetworkPolicySpec;
}

export class NetworkPolicy extends KubeObject<void, NetworkPolicySpec, "namespace-scoped"> {
  static readonly kind = "NetworkPolicy";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/networking.k8s.io/v1/networkpolicies";

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

export class NetworkPolicyApi extends KubeApi<NetworkPolicy> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      objectConstructor: NetworkPolicy,
      ...opts,
    });
  }
}

export const networkPolicyApi = isClusterPageContext()
  ? new NetworkPolicyApi()
  : undefined as never;
