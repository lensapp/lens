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

import styles from "./network-policy-details.module.css";

import React from "react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { IPolicyIpBlock, IPolicySelector, NetworkPolicy, NetworkPolicyPeer, NetworkPolicyPort } from "../../../common/k8s-api/endpoints/network-policy.api";
import { Badge } from "../badge";
import { SubTitle } from "../layout/sub-title";
import { observer } from "mobx-react";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";

interface Props extends KubeObjectDetailsProps<NetworkPolicy> {
}

@observer
export class NetworkPolicyDetails extends React.Component<Props> {
  renderIPolicyIpBlock(ipBlock: IPolicyIpBlock | undefined) {
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

  renderIPolicySelector(name: string, selector: IPolicySelector | undefined) {
    if (!selector) {
      return null;
    }

    return (
      <DrawerItem name={name}>
        {
          Object
            .entries(selector.matchLabels)
            .map(data => data.join(": "))
            .join(", ")
          || "(empty)"
        }
      </DrawerItem>
    );
  }

  renderNetworkPolicyPeers(name: string, peers: NetworkPolicyPeer[] | undefined) {
    if (!peers) {
      return null;
    }

    return (
      <>
        <SubTitle className={styles.networkPolicyPeerTitle} title={name}/>
        {
          peers.map((peer, index) => (
            <div key={index} className={styles.networkPolicyPeer}>
              {this.renderIPolicyIpBlock(peer.ipBlock)}
              {this.renderIPolicySelector("namespaceSelector", peer.namespaceSelector)}
              {this.renderIPolicySelector("podSelector", peer.podSelector)}
            </div>
          ))
        }
      </>
    );
  }

  renderNetworkPolicyPorts(ports: NetworkPolicyPort[] | undefined) {
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

  render() {
    const { object: policy } = this.props;

    if (!policy) {
      return null;
    }

    if (!(policy instanceof NetworkPolicy)) {
      logger.error("[NetworkPolicyDetails]: passed object that is not an instanceof NetworkPolicy", policy);

      return null;
    }

    const { ingress, egress } = policy.spec;
    const selector = policy.getMatchLabels();

    return (
      <div className={styles.NetworkPolicyDetails}>
        <KubeObjectMeta object={policy}/>

        <DrawerItem name="Pod Selector" labelsOnly={selector.length > 0}>
          {
            selector.length > 0
              ? policy.getMatchLabels().map(label => <Badge key={label} label={label}/>)
              : `(empty) (Allowing the specific traffic to all pods in this namespace)`
          }
        </DrawerItem>

        {ingress && (
          <>
            <DrawerTitle title="Ingress"/>
            {ingress.map((ingress, i) => (
              <div key={i} data-testid={`ingress-${i}`}>
                {this.renderNetworkPolicyPorts(ingress.ports)}
                {this.renderNetworkPolicyPeers("From", ingress.from)}
              </div>
            ))}
          </>
        )}

        {egress && (
          <>
            <DrawerTitle title="Egress"/>
            {egress.map((egress, i) => (
              <div key={i} data-testid={`egress-${i}`}>
                {this.renderNetworkPolicyPorts(egress.ports)}
                {this.renderNetworkPolicyPeers("To", egress.to)}
              </div>
            ))}
          </>
        )}
      </div>
    );
  }
}
