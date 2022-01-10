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

import React from "react";
import { observer } from "mobx-react";
import { nodesStore } from "../+nodes/nodes.store";
import { cssNames } from "../../utils";
import { Radio, RadioGroup } from "../radio";
import { ClusterOverviewStore, MetricNodeRole, MetricType } from "./cluster-overview-store/cluster-overview-store";
import clusterOverviewStoreInjectable from "./cluster-overview-store/cluster-overview-store.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";

interface Dependencies {
  clusterOverviewStore: ClusterOverviewStore
}

const NonInjectedClusterMetricSwitchers = observer(({ clusterOverviewStore }: Dependencies) => {
  const { masterNodes, workerNodes } = nodesStore;
  const metricsValues = clusterOverviewStore.getMetricsValues(clusterOverviewStore.metrics);
  const disableRoles = !masterNodes.length || !workerNodes.length;
  const disableMetrics = !metricsValues.length;

  return (
    <div className="flex gaps" style={{ marginBottom: "calc(var(--margin) * 2)" }}>
      <div className="box grow">
        <RadioGroup
          asButtons
          className={cssNames("RadioGroup flex gaps", { disabled: disableRoles })}
          value={clusterOverviewStore.metricNodeRole}
          onChange={(metric: MetricNodeRole) => clusterOverviewStore.metricNodeRole = metric}
        >
          <Radio label="Master" value={MetricNodeRole.MASTER}/>
          <Radio label="Worker" value={MetricNodeRole.WORKER}/>
        </RadioGroup>
      </div>
      <div className="box grow" style={{ textAlign: "right" }}>
        <RadioGroup
          asButtons
          className={cssNames("RadioGroup flex gaps", { disabled: disableMetrics })}
          value={clusterOverviewStore.metricType}
          onChange={(value: MetricType) => clusterOverviewStore.metricType = value}
        >
          <Radio label="CPU" value={MetricType.CPU}/>
          <Radio label="Memory" value={MetricType.MEMORY}/>
        </RadioGroup>
      </div>
    </div>
  );
});

export const ClusterMetricSwitchers = withInjectables<Dependencies>(
  NonInjectedClusterMetricSwitchers,

  {
    getProps: (di) => ({
      clusterOverviewStore: di.inject(clusterOverviewStoreInjectable),
    }),
  },
);

