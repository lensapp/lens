/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./details.module.scss";

import React from "react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { IPolicyIpBlock, NetworkPolicy, NetworkPolicyPeer, NetworkPolicyPort } from "../../../common/k8s-api/endpoints/network-policy.api";
import { Badge } from "../badge";
import { SubTitle } from "../layout/sub-title";
import { observer } from "mobx-react";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";
import type { LabelMatchExpression, LabelSelector } from "../../../common/k8s-api/kube-object";
import { isEmpty } from "lodash";
import { withInjectables } from "@ogre-tools/injectable-react";

export interface NetworkPolicyDetailsProps extends KubeObjectDetailsProps<NetworkPolicy> {
}

interface Dependencies {

}

function renderIPolicyIpBlock(ipBlock: IPolicyIpBlock | undefined) {
  if (!ipBlock) {
    return null;
  }

  const { cidr, except = [] } = ipBlock;

  if (!cidr) {
    return null;
  }

  const items = [`cidr: ${cidr}`];

  if (except.length > 0) {
    items.push(`except: ${except.join(", ")}`);
  }

  return (
    <DrawerItem name="ipBlock">
      {items.join(", ")}
    </DrawerItem>
  );
}

function renderMatchLabels(matchLabels: Record<string, string | undefined> | undefined) {
  if (!matchLabels) {
    return null;
  }

  return Object.entries(matchLabels)
    .map(([key, value]) => <li key={key}>{key}: {value}</li>);
}

function renderMatchExpressions(matchExpressions: LabelMatchExpression[] | undefined) {
  if (!matchExpressions) {
    return null;
  }

  return matchExpressions.map(expr => {
    switch (expr.operator) {
      case "DoesNotExist":
      case "Exists":
        return <li key={expr.key}>{expr.key} ({expr.operator})</li>;
      case "In":
      case "NotIn":
        return (
          <li key={expr.key}>
            {expr.key}({expr.operator})
            <ul>
              {expr.values.map((value, index) => <li key={index}>{value}</li>)}
            </ul>
          </li>
        );
    }
  });
}

function renderIPolicySelector(name: string, selector: LabelSelector | undefined) {
  if (!selector) {
    return null;
  }

  const { matchLabels, matchExpressions } = selector;

  return (
    <DrawerItem name={name}>
      <ul className={styles.policySelectorList}>
        {renderMatchLabels(matchLabels)}
        {renderMatchExpressions(matchExpressions)}
        {
          (isEmpty(matchLabels) && isEmpty(matchExpressions)) && (
            <li>(empty)</li>
          )
        }
      </ul>
    </DrawerItem>
  );
}

function renderNetworkPolicyPeers(name: string, peers: NetworkPolicyPeer[] | undefined) {
  if (!peers) {
    return null;
  }

  return (
    <>
      <SubTitle className={styles.networkPolicyPeerTitle} title={name}/>
      {
        peers.map((peer, index) => (
          <div key={index} className={styles.networkPolicyPeer}>
            {renderIPolicyIpBlock(peer.ipBlock)}
            {renderIPolicySelector("namespaceSelector", peer.namespaceSelector)}
            {renderIPolicySelector("podSelector", peer.podSelector)}
          </div>
        ))
      }
    </>
  );
}

function renderNetworkPolicyPorts(ports: NetworkPolicyPort[] | undefined) {
  if (!ports) {
    return null;
  }

  return (
    <DrawerItem name="Ports">
      <ul>
        {ports.map(({ protocol = "TCP", port = "<all>", endPort }, index) => (
          <li key={index}>
            {protocol}:{port}{typeof endPort === "number" && `:${endPort}`}
          </li>
        ))}
      </ul>
    </DrawerItem>
  );
}

const NonInjectedNetworkPolicyDetails = observer(({ object: networkPolicy }: Dependencies & NetworkPolicyDetailsProps) => {
  if (!networkPolicy) {
    return null;
  }

  if (!(networkPolicy instanceof NetworkPolicy)) {
    logger.error("[NetworkPolicyDetails]: passed object that is not an instanceof NetworkPolicy", networkPolicy);

    return null;
  }

  const { ingress, egress } = networkPolicy.spec;
  const selector = networkPolicy.getMatchLabels();

  return (
    <div className={styles.NetworkPolicyDetails}>
      <KubeObjectMeta object={networkPolicy}/>

      <DrawerItem name="Pod Selector" labelsOnly={selector.length > 0}>
        {
          selector.length > 0
            ? networkPolicy.getMatchLabels().map(label => <Badge key={label} label={label}/>)
            : `(empty) (Allowing the specific traffic to all pods in this namespace)`
        }
      </DrawerItem>

      {ingress && (
        <>
          <DrawerTitle title="Ingress"/>
          {ingress.map((ingress, i) => (
            <div key={i} data-testid={`ingress-${i}`}>
              {renderNetworkPolicyPorts(ingress.ports)}
              {renderNetworkPolicyPeers("From", ingress.from)}
            </div>
          ))}
        </>
      )}

      {egress && (
        <>
          <DrawerTitle title="Egress"/>
          {egress.map((egress, i) => (
            <div key={i} data-testid={`egress-${i}`}>
              {renderNetworkPolicyPorts(egress.ports)}
              {renderNetworkPolicyPeers("To", egress.to)}
            </div>
          ))}
        </>
      )}
    </div>
  );
});

export const NetworkPolicyDetails = withInjectables<Dependencies, NetworkPolicyDetailsProps>(NonInjectedNetworkPolicyDetails, {
  getProps: (di, props) => ({
    ...props,
  }),
});
