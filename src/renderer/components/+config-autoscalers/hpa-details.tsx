/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./hpa-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { cssNames } from "../../utils";
import type { IHpaMetric } from "../../../common/k8s-api/endpoints/hpa.api";
import { HorizontalPodAutoscaler, HpaMetricType } from "../../../common/k8s-api/endpoints/hpa.api";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { KubeObjectMeta } from "../kube-object-meta";
import { getDetailsUrl } from "../kube-detail-params";
import logger from "../../../common/logger";

export interface HpaDetailsProps extends KubeObjectDetailsProps<HorizontalPodAutoscaler> {
}

@observer
export class HpaDetails extends React.Component<HpaDetailsProps> {
  renderMetrics() {
    const { object: hpa } = this.props;

    const renderName = (metric: IHpaMetric) => {
      switch (metric.type) {
        case HpaMetricType.Resource: {
          const addition = metric.resource.targetAverageUtilization
            ? "(as a percentage of request)"
            : "";

          return <>Resource {metric.resource.name} on Pods {addition}</>;
        }
        case HpaMetricType.Pods:
          return <>{metric.pods.metricName} on Pods</>;

        case HpaMetricType.Object: {
          const { target } = metric.object;
          const { kind, name } = target;
          const objectUrl = getDetailsUrl(apiManager.lookupApiLink(target, hpa));

          return (
            <>
              {metric.object.metricName} on{" "}
              <Link to={objectUrl}>{kind}/{name}</Link>
            </>
          );
        }
        case HpaMetricType.External:
          return (
            <>
              {metric.external.metricName} on{" "}
              {JSON.stringify(metric.external.selector)}
            </>
          );
      }
    };

    return (
      <Table>
        <TableHead>
          <TableCell className="name">Name</TableCell>
          <TableCell className="metrics">Current / Target</TableCell>
        </TableHead>
        {
          hpa.getMetrics()
            .map((metric, index) => (
              <TableRow key={index}>
                <TableCell className="name">{renderName(metric)}</TableCell>
                <TableCell className="metrics">{hpa.getMetricValues(metric)}</TableCell>
              </TableRow>
            ))
        }
      </Table>
    );
  }

  render() {
    const { object: hpa } = this.props;

    if (!hpa) {
      return null;
    }

    if (!(hpa instanceof HorizontalPodAutoscaler)) {
      logger.error("[HpaDetails]: passed object that is not an instanceof HorizontalPodAutoscaler", hpa);

      return null;
    }

    const { scaleTargetRef } = hpa.spec;

    return (
      <div className="HpaDetails">
        <KubeObjectMeta object={hpa}/>

        <DrawerItem name="Reference">
          {scaleTargetRef && (
            <Link to={getDetailsUrl(apiManager.lookupApiLink(scaleTargetRef, hpa))}>
              {scaleTargetRef.kind}/{scaleTargetRef.name}
            </Link>
          )}
        </DrawerItem>

        <DrawerItem name="Min Pods">
          {hpa.getMinPods()}
        </DrawerItem>

        <DrawerItem name="Max Pods">
          {hpa.getMaxPods()}
        </DrawerItem>

        <DrawerItem name="Replicas">
          {hpa.getReplicas()}
        </DrawerItem>

        <DrawerItem name="Status" className="status" labelsOnly>
          {hpa.getConditions().map(({ type, tooltip, isReady }) => {
            if (!isReady) return null;

            return (
              <Badge
                key={type}
                label={type}
                tooltip={tooltip}
                className={cssNames({ [type.toLowerCase()]: isReady })}
              />
            );
          })}
        </DrawerItem>

        <DrawerTitle>Metrics</DrawerTitle>
        <div className="metrics">
          {this.renderMetrics()}
        </div>
      </div>
    );
  }
}
