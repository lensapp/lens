/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { cssNames } from "@k8slens/utilities";
import type { HorizontalPodAutoscalerMetricSpec, HorizontalPodAutoscalerMetricTarget } from "@k8slens/kube-object";
import { HorizontalPodAutoscaler } from "@k8slens/kube-object";
import { Table, TableCell, TableHead, TableRow } from "../table";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import type { Logger } from "../../../common/logger";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import getHorizontalPodAutoscalerMetrics from "./get-metrics.injectable";
import { getMetricName } from "./get-metric-name";

export interface HpaDetailsProps extends KubeObjectDetailsProps<HorizontalPodAutoscaler> {
}

interface Dependencies {
  apiManager: ApiManager;
  logger: Logger;
  getDetailsUrl: GetDetailsUrl;
  getMetrics: (hpa: HorizontalPodAutoscaler) => string[];
}

@observer
class NonInjectedHorizontalPodAutoscalerDetails extends React.Component<HpaDetailsProps & Dependencies> {
  private renderTargetLink(target: HorizontalPodAutoscalerMetricTarget | undefined) {
    if (!target) {
      return null;
    }

    const { object: hpa, apiManager, getDetailsUrl } = this.props;
    const { kind, name } = target;
    const objectUrl = getDetailsUrl(apiManager.lookupApiLink(target, hpa));

    return (
      <>
        on
        <Link to={objectUrl}>
          {`${kind}/${name}`}
        </Link>
      </>
    );
  }

  renderMetrics() {
    const { object: hpa } = this.props;

    const renderName = (metric: HorizontalPodAutoscalerMetricSpec) => {
      const metricName = getMetricName(metric);

      switch (metric?.type) {
        case "ContainerResource":

        // fallthrough
        case "Resource": {
          const metricSpec = metric.resource ?? metric.containerResource;

          return `Resource ${metricSpec.name} on Pods`;
        }
        case "Pods":
          return `${metricName ?? ""} on Pods`;

        case "Object": {
          return (
            <>
              {metricName}
              {" "}
              {this.renderTargetLink(metric.object?.describedObject)}
            </>
          );
        }
        case "External":
          return `${metricName ?? ""} on ${JSON.stringify(metric.external.metricSelector ?? metric.external.metric?.selector)}`;
        default:
          return hpa.spec?.targetCPUUtilizationPercentage ? "CPU Utilization percentage" : "unknown";
      }
    };

    return (
      <Table data-testid="hpa-metrics">
        <TableHead flat>
          <TableCell className="name">Name</TableCell>
          <TableCell className="metrics">Current / Target</TableCell>
        </TableHead>
        {
          this.props.getMetrics(hpa)
            .map((metrics, index) => (
              <TableRow key={index}>
                <TableCell className="name">{renderName(hpa.getMetrics()[index])}</TableCell>
                <TableCell className="metrics">{metrics}</TableCell>
              </TableRow>
            ))
        }
      </Table>
    );
  }

  render() {
    const { object: hpa, apiManager, getDetailsUrl, logger } = this.props;

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
        <DrawerItem name="Reference">
          {scaleTargetRef && (
            <Link to={getDetailsUrl(apiManager.lookupApiLink(scaleTargetRef, hpa))}>
              {scaleTargetRef.kind}
              /
              {scaleTargetRef.name}
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

        <DrawerItem
          name="Status"
          className="status"
          labelsOnly
        >
          {hpa.getReadyConditions()
            .map(({ type, tooltip, isReady }) => (
              <Badge
                key={type}
                label={type}
                tooltip={tooltip}
                className={cssNames({ [type.toLowerCase()]: isReady })}
              />
            ))}
        </DrawerItem>

        {(hpa.getMetrics().length !== 0 || hpa.spec?.targetCPUUtilizationPercentage) && (
          <>
            <DrawerTitle>Metrics</DrawerTitle>
            <div className="metrics">
              {this.renderMetrics()}
            </div>
          </>
        )}
      </div>
    );
  }
}

export const HorizontalPodAutoscalerDetails = withInjectables<Dependencies, HpaDetailsProps>(NonInjectedHorizontalPodAutoscalerDetails, {
  getProps: (di, props) => ({
    ...props,
    apiManager: di.inject(apiManagerInjectable),
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    logger: di.inject(loggerInjectable),
    getMetrics: di.inject(getHorizontalPodAutoscalerMetrics),
  }),
});
