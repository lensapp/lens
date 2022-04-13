/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import type { NodeStore } from "../+nodes/store";
import { cssNames } from "../../utils";
import { Radio, RadioGroup } from "../radio";
import type { ClusterOverviewStore } from "./cluster-overview-store/cluster-overview-store";
import { MetricNodeRole, MetricType } from "./cluster-overview-store/cluster-overview-store";
import clusterOverviewStoreInjectable from "./cluster-overview-store/cluster-overview-store.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import nodeStoreInjectable from "../+nodes/store.injectable";

interface Dependencies {
  clusterOverviewStore: ClusterOverviewStore;
  nodeStore: NodeStore;
}

const NonInjectedClusterMetricSwitchers = observer(({
  clusterOverviewStore,
  nodeStore,
}: Dependencies) => {
  const { masterNodes, workerNodes } = nodeStore;
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
          onChange={metric => clusterOverviewStore.metricNodeRole = metric}
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
          onChange={value => clusterOverviewStore.metricType = value}
        >
          <Radio label="CPU" value={MetricType.CPU}/>
          <Radio label="Memory" value={MetricType.MEMORY}/>
        </RadioGroup>
      </div>
    </div>
  );
});

export const ClusterMetricSwitchers = withInjectables<Dependencies>(NonInjectedClusterMetricSwitchers, {
  getProps: (di) => ({
    clusterOverviewStore: di.inject(clusterOverviewStoreInjectable),
    nodeStore: di.inject(nodeStoreInjectable),
  }),
});

