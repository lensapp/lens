/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { ILoadBalancerIngress, Ingress } from "../../../common/k8s-api/endpoints";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { ResourceMetrics } from "../resource-metrics";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { IngressCharts } from "./charts";
import { KubeObjectMeta } from "../kube-object-meta";
import { getBackendServiceNamePort, getMetricsForIngress, IIngressMetrics } from "../../../common/k8s-api/endpoints/ingress.api";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import isMetricHiddenInjectable from "../../utils/is-metrics-hidden.injectable";

export interface IngressDetailsProps extends KubeObjectDetailsProps<Ingress> {
}

interface Dependencies {
  isMetricHidden: boolean;
}

const NonInjectedIngressDetails = observer(({ isMetricHidden, object: ingress }: Dependencies & IngressDetailsProps) => {
  const [metrics, setMetrics] = useState<IIngressMetrics | null>(null);

  useEffect(() => setMetrics(null), [ingress]);

  const loadMetrics = async () => {
    setMetrics(await getMetricsForIngress(ingress.getName(), ingress.getNs()));
  };

  const renderPaths = () => {
    const { spec: { rules }} = ingress;

    if (!rules || !rules.length) return null;

    return rules.map((rule, index) => (
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
              <TableCell className="backends">Backends</TableCell>
            </TableHead>
            {rule.http.paths.map((path, index) => {
              const { serviceName, servicePort } = getBackendServiceNamePort(path.backend);

              return (
                <TableRow key={index}>
                  <TableCell className="path">{path.path || ""}</TableCell>
                  <TableCell className="backends">
                    <p>{serviceName}:{servicePort}</p>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        )}
      </div>
    ));
  };

  const renderIngressPoints = (ingressPoints: ILoadBalancerIngress[]) => {
    if (!ingressPoints || ingressPoints.length === 0) return null;

    return (
      <div>
        <Table className="ingress-points">
          <TableHead>
            <TableCell className="name">Hostname</TableCell>
            <TableCell className="ingresspoints">IP</TableCell>
          </TableHead>
          {ingressPoints.map(({ hostname, ip }, index) => (
            <TableRow key={index}>
              <TableCell className="name">{hostname ? hostname : "-"}</TableCell>
              <TableCell className="ingresspoints">{ip ? ip : "-"}</TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    );
  };

  if (!ingress) {
    return null;
  }

  if (!(ingress instanceof Ingress)) {
    logger.error("[IngressDetails]: passed object that is not an instanceof Ingress", ingress);

    return null;
  }

  const { spec, status } = ingress;
  const ingressPoints = status?.loadBalancer?.ingress;
  const { serviceName, servicePort } = ingress.getServiceNamePort();

  return (
    <div className="IngressDetails">
      {!isMetricHidden && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={[
            "Network",
            "Duration",
          ]}
          object={ingress}
          metrics={metrics}
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
      <DrawerTitle title="Rules"/>
      {renderPaths()}

      <DrawerTitle title="Load-Balancer Ingress Points"/>
      {renderIngressPoints(ingressPoints)}
    </div>
  );
});

export const IngressDetails = withInjectables<Dependencies, IngressDetailsProps>(NonInjectedIngressDetails, {
  getProps: (di, props) => ({
    isMetricHidden: di.inject(isMetricHiddenInjectable, {
      metricType: ClusterMetricsResourceType.Ingress,
    }),
    ...props,
  }),
});

