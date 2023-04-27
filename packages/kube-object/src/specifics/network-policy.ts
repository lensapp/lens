/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";

export interface PolicyIpBlock {
  cidr: string;
  except?: string[];
}

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
  ipBlock?: PolicyIpBlock;

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

export interface PolicyIngress {
  from?: NetworkPolicyPeer[];
  ports?: NetworkPolicyPort[];
}

export interface PolicyEgress {
  to?: NetworkPolicyPeer[];
  ports?: NetworkPolicyPort[];
}

export type PolicyType = "Ingress" | "Egress";

export interface NetworkPolicySpec {
  podSelector: LabelSelector;
  policyTypes?: PolicyType[];
  ingress?: PolicyIngress[];
  egress?: PolicyEgress[];
}

export class NetworkPolicy extends KubeObject<NamespaceScopedMetadata, void, NetworkPolicySpec> {
  static readonly kind = "NetworkPolicy";

  static readonly namespaced = true;

  static readonly apiBase = "/apis/networking.k8s.io/v1/networkpolicies";

  getMatchLabels(): string[] {
    if (!this.spec.podSelector || !this.spec.podSelector.matchLabels) {
      return [];
    }

    return Object.entries(this.spec.podSelector.matchLabels).map((data) => data.join(":"));
  }

  getTypes(): string[] {
    if (!this.spec.policyTypes) {
      return [];
    }

    return this.spec.policyTypes;
  }
}
