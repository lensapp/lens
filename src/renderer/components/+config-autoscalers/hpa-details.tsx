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
import type { HorizontalPodAutoscalerMetricSpec, HorizontalPodAutoscalerMetricTarget } from "../../../common/k8s-api/endpoints/horizontal-pod-autoscaler.api";
import { HorizontalPodAutoscaler, HpaMetricType } from "../../../common/k8s-api/endpoints/horizontal-pod-autoscaler.api";
import { Table, TableCell, TableHead, TableRow } from "../table";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";

export interface HpaDetailsProps extends KubeObjectDetailsProps<HorizontalPodAutoscaler> {
}

interface Dependencies {
  apiManager: ApiManager;
  getDetailsUrl: GetDetailsUrl;
}

@observer
class NonInjectedHpaDetails extends React.Component<HpaDetailsProps & Dependencies> {
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
      switch (metric.type) {
        case HpaMetricType.ContainerResource:

        // fallthrough
        case HpaMetricType.Resource: {
          const metricSpec = metric.resource ?? metric.containerResource;
          const addition = metricSpec.targetAverageUtilization
            ? "(as a percentage of request)"
            : "";

          return (
            <>
              Resource
              {metricSpec.name}
              {" "}
              on Pods
              {addition}
            </>
          );
        }
        case HpaMetricType.Pods:
          return (
            <>
              {metric.pods.metricName}
              {" "}
              on Pods
            </>
          );

        case HpaMetricType.Object: {
          return (
            <>
              {metric.object.metricName}
              {" "}
              {this.renderTargetLink(metric.object.target)}
            </>
          );
        }
        case HpaMetricType.External:
          return (
            <>
              {metric.external.metricName}
              {" "}
              on
              {" "}
              {JSON.stringify(metric.external.metricSelector)}
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
    const { object: hpa, apiManager, getDetailsUrl } = this.props;

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

        <DrawerTitle>Metrics</DrawerTitle>
        <div className="metrics">
          {this.renderMetrics()}
        </div>
      </div>
    );
  }
}

export const HpaDetails = withInjectables<Dependencies, HpaDetailsProps>(NonInjectedHpaDetails, {
  getProps: (di, props) => ({
    ...props,
    apiManager: di.inject(apiManagerInjectable),
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
  }),
});
