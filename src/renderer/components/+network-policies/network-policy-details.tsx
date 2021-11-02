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

import "./network-policy-details.scss";

import get from "lodash/get";
import React, { Fragment } from "react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { IPolicyEgress, IPolicyIngress, IPolicyIpBlock, IPolicySelector, NetworkPolicy } from "../../../common/k8s-api/endpoints/network-policy.api";
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
  renderIngressFrom(ingress: IPolicyIngress) {
    const { from } = ingress;

    if (!from) return null;

    return (
      <>
        <SubTitle title="From"/>
        {from.map(item =>
          Object.keys(item).map(key => {
            const data = get(item, key);

            if (key === "ipBlock") {
              const { cidr, except } = data as IPolicyIpBlock;

              if (!cidr) return null;

              return (
                <DrawerItem name={key} key={key}>
                  cidr: {cidr}, {" "}
                  {except &&
                  `except: ${except.join(", ")}`
                  }
                </DrawerItem>
              );
            }
            const selector: IPolicySelector = data;

            if (selector.matchLabels) {
              return (
                <DrawerItem name={key} key={key}>
                  {
                    Object
                      .entries(selector.matchLabels)
                      .map(data => data.join(": "))
                      .join(", ")
                  }
                </DrawerItem>
              );
            }
            else {
              return (<DrawerItem name={key} key={key}>(empty)</DrawerItem>);
            }
          }),
        )}
      </>
    );
  }

  renderEgressTo(egress: IPolicyEgress) {
    const { to } = egress;

    if (!to) return null;

    return (
      <>
        <SubTitle title="To"/>
        {to.map(item => {
          const { ipBlock: { cidr, except } = {}} = item;

          if (!cidr) return null;

          return (
            <DrawerItem name="ipBlock" key={cidr}>
              cidr: {cidr}, {" "}
              {except &&
              `except: ${except.join(", ")}`
              }
            </DrawerItem>
          );
        })}
      </>
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
      <div className="NetworkPolicyDetails">
        <KubeObjectMeta object={policy}/>

        <DrawerItem name="Pod Selector" labelsOnly={selector.length > 0}>
          {selector.length > 0 ?
            policy.getMatchLabels().map(label => <Badge key={label} label={label}/>) :
            `(empty) (Allowing the specific traffic to all pods in this namespace)`
          }
        </DrawerItem>

        {ingress && (
          <>
            <DrawerTitle title="Ingress"/>
            {ingress.map((ingress, i) => {
              const { ports } = ingress;

              return (
                <Fragment key={i}>
                  <DrawerItem name="Ports">
                    {ports && ports.map(({ port, protocol }) => `${protocol || ""}:${port || ""}`).join(", ")}
                  </DrawerItem>
                  {this.renderIngressFrom(ingress)}
                </Fragment>
              );
            })}
          </>
        )}

        {egress && (
          <>
            <DrawerTitle title="Egress"/>
            {egress.map((egress, i) => {
              const { ports } = egress;

              return (
                <Fragment key={i}>
                  <DrawerItem name="Ports">
                    {ports && ports.map(({ port, protocol }) => `${protocol || ""}:${port || ""}`).join(", ")}
                  </DrawerItem>
                  {this.renderEgressTo(egress)}
                </Fragment>
              );
            })}
          </>
        )}
      </div>
    );
  }
}
