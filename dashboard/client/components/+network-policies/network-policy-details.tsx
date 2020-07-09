import "./network-policy-details.scss";

import get from "lodash/get";
import React, { Fragment } from "react";
import { t, Trans } from "@lingui/macro";
import { DrawerItem, DrawerTitle } from "../drawer";
import { PolicyEgress, PolicyIngress, PolicyIpBlock, PolicySelector, NetworkPolicy, networkPolicyApi } from "../../api/endpoints/network-policy.api";
import { Badge } from "../badge";
import { SubTitle } from "../layout/sub-title";
import { KubeEventDetails } from "../+events/kube-event-details";
import { observer } from "mobx-react";
import { KubeObjectDetailsProps } from "../kube-object";
import { _i18n } from "../../i18n";
import { apiManager } from "../../api/api-manager";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<NetworkPolicy> {
}

@observer
export class NetworkPolicyDetails extends React.Component<Props> {
  renderIngressFrom(ingress: PolicyIngress): JSX.Element {
    const { from } = ingress;
    if (!from) {
      return null;
    }
    return (
      <>
        <SubTitle title={<Trans>From</Trans>}/>
        {from.map(item =>
          Object.keys(item).map(key => {
            const data = get(item, key);
            if (key === "ipBlock") {
              const { cidr, except } = data as PolicyIpBlock;
              if (!cidr) {
                return;
              }
              return (
                <DrawerItem name={key} key={key}>
                  cidr: {cidr}, {" "}
                  {except &&
                  `except: ${except.join(", ")}`
                  }
                </DrawerItem>
              );
            }
            const selector: PolicySelector = data;
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
            } else {
              return (<DrawerItem name={key} key={key}>(empty)</DrawerItem>);
            }
          })
        )}
      </>
    );
  }

  renderEgressTo(egress: PolicyEgress): JSX.Element | null {
    const { to } = egress;
    if (!to) {
      return null;
    }
    return (
      <>
        <SubTitle title={<Trans>To</Trans>}/>
        {to.map(item => {
          const { ipBlock } = item;
          if (!ipBlock) {
            return;
          }
          const { cidr, except } = ipBlock;
          if (!cidr) {
            return;
          }
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

  render(): JSX.Element | null {
    const { object: policy } = this.props;
    if (!policy) {
      return null;
    }
    const { ingress, egress } = policy.spec;
    const selector = policy.getMatchLabels();
    return (
      <div className="NetworkPolicyDetails">
        <KubeObjectMeta object={policy}/>

        <DrawerItem name={<Trans>Pod Selector</Trans>} labelsOnly={selector.length > 0}>
          {selector.length > 0 ?
            policy.getMatchLabels().map(label => <Badge key={label} label={label}/>) :
            _i18n._(t`(empty) (Allowing the specific traffic to all pods in this namespace)`)
          }
        </DrawerItem>

        {ingress && (
          <>
            <DrawerTitle title={_i18n._(t`Ingress`)}/>
            {ingress.map((ingress, i) => {
              const { ports } = ingress;
              return (
                <Fragment key={i}>
                  <DrawerItem name={<Trans>Ports</Trans>}>
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
            <DrawerTitle title={<Trans>Egress</Trans>}/>
            {egress.map((egress, i) => {
              const { ports } = egress;
              return (
                <Fragment key={i}>
                  <DrawerItem name={<Trans>Ports</Trans>}>
                    {ports && ports.map(({ port, protocol }) => `${protocol || ""}:${port || ""}`).join(", ")}
                  </DrawerItem>
                  {this.renderEgressTo(egress)}
                </Fragment>
              );
            })}
          </>
        )}

        <KubeEventDetails object={policy}/>
      </div>
    );
  }
}

apiManager.registerViews(networkPolicyApi, {
  Details: NetworkPolicyDetails
});