/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./ingress-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { makeObservable, observable, reaction } from "mobx";
import { DrawerItem, DrawerTitle } from "../drawer";
import type { ILoadBalancerIngress } from "../../../common/k8s-api/endpoints";
import { Ingress } from "../../../common/k8s-api/endpoints";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { ResourceMetrics } from "../resource-metrics";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { IngressCharts } from "./ingress-charts";
import { KubeObjectMeta } from "../kube-object-meta";
import { computeRuleDeclarations, getMetricsForIngress, type IIngressMetrics } from "../../../common/k8s-api/endpoints/ingress.api";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster/types";
import logger from "../../../common/logger";

export interface IngressDetailsProps extends KubeObjectDetailsProps<Ingress> {
}

@observer
export class IngressDetails extends React.Component<IngressDetailsProps> {
  @observable metrics: IIngressMetrics = null;

  constructor(props: IngressDetailsProps) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.metrics = null;
      }),
    ]);
  }

  loadMetrics = async () => {
    const { object: ingress } = this.props;

    this.metrics = await getMetricsForIngress(ingress.getName(), ingress.getNs());
  };

  renderPaths(ingress: Ingress) {
    return ingress.getRules()
      .map((rule, index) => (
        <div className="rules" key={index}>
          {rule.host && (
            <div className="host-title">
              <>Host: {rule.host}</>
            </div>
          )}
          {rule.http && (
            <Table className="paths">
              <TableHead>
                <TableCell className="path">Path</TableCell>
                <TableCell className="link">Link</TableCell>
                <TableCell className="backends">Backends</TableCell>
              </TableHead>
              {
                computeRuleDeclarations(ingress, rule)
                  .map(({ displayAsLink, service, url, pathname }) => (
                    <TableRow key={index}>
                      <TableCell className="path">{pathname}</TableCell>
                      <TableCell className="link">
                        {
                          displayAsLink
                            ? (
                              <a href={url} rel="noreferrer" target="_blank">
                                {url}
                              </a>
                            )
                            : url
                        }
                      </TableCell>
                      <TableCell className="backends">{service}</TableCell>
                    </TableRow>
                  ))
              }
            </Table>
          )}
        </div>
      ));
  }

  renderIngressPoints(ingressPoints: ILoadBalancerIngress[]) {
    if (!ingressPoints || ingressPoints.length === 0) return null;

    return (
      <div>
        <Table className="ingress-points">
          <TableHead>
            <TableCell className="name">Hostname</TableCell>
            <TableCell className="ingresspoints">IP</TableCell>
          </TableHead>
          {
            ingressPoints.map(({ hostname, ip }, index) => (
              <TableRow key={index}>
                <TableCell className="name">{hostname ? hostname : "-"}</TableCell>
                <TableCell className="ingresspoints">{ip ? ip : "-"}</TableCell>
              </TableRow>
            ))
          }
        </Table>
      </div>
    );
  }

  render() {
    const { object: ingress } = this.props;

    if (!ingress) {
      return null;
    }

    if (!(ingress instanceof Ingress)) {
      logger.error("[IngressDetails]: passed object that is not an instanceof Ingress", ingress);

      return null;
    }

    const { spec, status } = ingress;
    const ingressPoints = status?.loadBalancer?.ingress;
    const { metrics } = this;
    const metricTabs = [
      "Network",
      "Duration",
    ];
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Ingress);
    const { serviceName, servicePort } = ingress.getServiceNamePort();

    return (
      <div className="IngressDetails">
        {!isMetricHidden && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={metricTabs} object={ingress} params={{ metrics }}
          >
            <IngressCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={ingress}/>
        <DrawerItem name="Ports">
          {ingress.getPorts()}
        </DrawerItem>
        {spec.tls &&
        <DrawerItem name="TLS">
          {spec.tls.map((tls, index) => <p key={index}>{tls.secretName}</p>)}
        </DrawerItem>
        }
        {serviceName && servicePort &&
        <DrawerItem name="Service">
          {serviceName}:{servicePort}
        </DrawerItem>
        }
        <DrawerTitle>Rules</DrawerTitle>
        {this.renderPaths(ingress)}

        <DrawerTitle>Load-Balancer Ingress Points</DrawerTitle>
        {this.renderIngressPoints(ingressPoints)}
      </div>
    );
  }
}
