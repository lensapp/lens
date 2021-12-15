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

import "./hpa-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { cssNames } from "../../utils";
import { HorizontalPodAutoscaler, HpaMetricType, IHpaMetric } from "../../../common/k8s-api/endpoints/hpa.api";
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

        <DrawerTitle title="Metrics"/>
        <div className="metrics">
          {this.renderMetrics()}
        </div>
      </div>
    );
  }
}
