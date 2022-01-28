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
import { HorizontalPodAutoscaler, HpaMetricType, IHpaMetric } from "../../../common/k8s-api/endpoints/horizontal-pod-autoscaler.api";
import { Table, TableCell, TableHead, TableRow } from "../table";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { KubeObjectMeta } from "../kube-object-meta";
import { getDetailsUrl } from "../kube-detail-params";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";

export interface HpaDetailsProps extends KubeObjectDetailsProps<HorizontalPodAutoscaler> {
}

interface Dependencies {
  apiManager: ApiManager;
}

const NonInjectedHpaDetails = observer(({ apiManager, object: hpa }: Dependencies & HpaDetailsProps) => {
  if (!hpa) {
    return null;
  }

  if (!(hpa instanceof HorizontalPodAutoscaler)) {
    logger.error("[HpaDetails]: passed object that is not an instanceof HorizontalPodAutoscaler", hpa);

    return null;
  }

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
        {hpa.getConditions().map(({ type, tooltip, isReady }) => (
          isReady
            ? (
              <Badge
                key={type}
                label={type}
                tooltip={tooltip}
                className={type.toLowerCase()}
              />
            )
            : null
        ))}
      </DrawerItem>

      <DrawerTitle title="Metrics"/>
      <div className="metrics">
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
      </div>
    </div>
  );
});

export const HpaDetails = withInjectables<Dependencies, HpaDetailsProps>(NonInjectedHpaDetails, {
  getProps: (di, props) => ({
    apiManager: di.inject(apiManagerInjectable),
    ...props,
  }),
});
