/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import type { NodeStore } from "../+nodes/store";
import { Radio, RadioGroup } from "../radio";
import type { ClusterOverviewStore } from "./cluster-overview-store/cluster-overview-store";
import { MetricNodeRole, MetricType } from "./cluster-overview-store/cluster-overview-store";
import clusterOverviewStoreInjectable from "./cluster-overview-store/cluster-overview-store.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import nodeStoreInjectable from "../+nodes/store.injectable";
import { normalizeMetrics } from "../../../common/k8s-api/endpoints/metrics.api";

interface Dependencies {
  clusterOverviewStore: ClusterOverviewStore;
  nodeStore: NodeStore;
}

const NonInjectedClusterMetricSwitchers = observer(({
  clusterOverviewStore,
  nodeStore,
}: Dependencies) => {
  const { masterNodes, workerNodes } = nodeStore;
  const { cpuUsage, memoryUsage } = clusterOverviewStore.metrics;
  const hasMasterNodes = masterNodes.length > 0;
  const hasWorkerNodes = workerNodes.length > 0;
  const hasCpuMetrics = normalizeMetrics(cpuUsage).data.result[0].values.length > 0;
  const hasMemoryMetrics = normalizeMetrics(memoryUsage).data.result[0].values.length > 0;

  return (
    <div className="flex gaps" style={{ marginBottom: "calc(var(--margin) * 2)" }}>
      <div className="box grow">
        <RadioGroup
          asButtons
          className="RadioGroup flex gaps"
          value={clusterOverviewStore.metricNodeRole}
          onChange={metric => clusterOverviewStore.metricNodeRole = metric}
        >
          <Radio
            label="Master"
            value={MetricNodeRole.MASTER}
            disabled={!hasMasterNodes}
          />
          <Radio
            label="Worker"
            value={MetricNodeRole.WORKER}
            disabled={!hasWorkerNodes}
          />
        </RadioGroup>
      </div>
      <div className="box grow" style={{ textAlign: "right" }}>
        <RadioGroup
          asButtons
          className="RadioGroup flex gaps"
          value={clusterOverviewStore.metricType}
          onChange={value => clusterOverviewStore.metricType = value}
        >
          <Radio
            label="CPU"
            value={MetricType.CPU}
            disabled={!hasCpuMetrics}
          />
          <Radio
            label="Memory"
            value={MetricType.MEMORY}
            disabled={!hasMemoryMetrics}
          />
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

