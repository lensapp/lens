/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./pie-charts.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { Spinner } from "../spinner";
import { Icon } from "../icon";
import { ChartData, PieChart } from "../chart";
import { ClusterNoMetrics } from "./no-metrics";
import { bytesToUnits, cssNames } from "../../utils";
import type { Theme } from "../../themes/store";
import { getMetricLastPoints } from "../../../common/k8s-api/endpoints/metrics.api";
import type { IClusterMetrics, Node } from "../../../common/k8s-api/endpoints";
import { MetricNodeRole } from "./overview.state";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import activeThemeInjectable from "../../themes/active-theme.injectable";

function createLabels(rawLabelData: [string, number | undefined][]): string[] {
  return rawLabelData.map(([key, value]) => `${key}: ${value?.toFixed(2) || "N/A"}`);
}

export interface ClusterPieChartsProps {
  metrics: IClusterMetrics | null;
  metricsNodeRole: MetricNodeRole;
  masterNodes: Node[];
  workerNodes: Node[];
}

interface Dependencies {
  activeTheme: IComputedValue<Theme>;
}

const NonInjectedClusterPieCharts = observer(({
  activeTheme,
  masterNodes,
  metrics,
  metricsNodeRole,
  workerNodes,
}: Dependencies & ClusterPieChartsProps) => {
  const renderLimitWarning = () => {
    return (
      <div className="node-warning flex gaps align-center">
        <Icon material="info"/>
        <p>Specified limits are higher than node capacity!</p>
      </div>
    );
  };

  const renderCharts = (data: Partial<Record<string, number>>) => {
    const { memoryUsage, memoryRequests, memoryAllocatableCapacity, memoryCapacity, memoryLimits } = data;
    const { cpuUsage, cpuRequests, cpuAllocatableCapacity, cpuCapacity, cpuLimits } = data;
    const { podUsage, podAllocatableCapacity, podCapacity } = data;
    const cpuLimitsOverload = cpuLimits > cpuAllocatableCapacity;
    const memoryLimitsOverload = memoryLimits > memoryAllocatableCapacity;
    const defaultColor = activeTheme.get().colors.pieChartDefaultColor;

    if (!memoryCapacity || !cpuCapacity || !podCapacity || !memoryAllocatableCapacity || !cpuAllocatableCapacity || !podAllocatableCapacity) return null;
    const cpuData: ChartData = {
      datasets: [
        {
          data: [
            cpuUsage,
            cpuUsage ? cpuAllocatableCapacity - cpuUsage : 1,
          ],
          backgroundColor: [
            "#c93dce",
            defaultColor,
          ],
          id: "cpuUsage",
          label: "Usage",
        },
        {
          data: [
            cpuRequests,
            cpuRequests ? cpuAllocatableCapacity - cpuRequests : 1,
          ],
          backgroundColor: [
            "#4caf50",
            defaultColor,
          ],
          id: "cpuRequests",
          label: "Requests",
        },
        {
          data: [
            cpuLimits,
            cpuLimitsOverload ? 0 : cpuAllocatableCapacity - cpuLimits,
          ],
          backgroundColor: [
            "#3d90ce",
            defaultColor,
          ],
          id: "cpuLimits",
          label: "Limits",
        },
      ],
      labels: createLabels([
        ["Usage", cpuUsage],
        ["Requests", cpuRequests],
        ["Limits", cpuLimits],
        ["Allocatable Capacity", cpuAllocatableCapacity],
        ["Capacity", cpuCapacity],
      ]),
    };
    const memoryData: ChartData = {
      datasets: [
        {
          data: [
            memoryUsage,
            memoryUsage ? memoryAllocatableCapacity - memoryUsage : 1,
          ],
          backgroundColor: [
            "#c93dce",
            defaultColor,
          ],
          id: "memoryUsage",
          label: "Usage",
        },
        {
          data: [
            memoryRequests,
            memoryRequests ? memoryAllocatableCapacity - memoryRequests : 1,
          ],
          backgroundColor: [
            "#4caf50",
            defaultColor,
          ],
          id: "memoryRequests",
          label: "Requests",
        },
        {
          data: [
            memoryLimits,
            memoryLimitsOverload ? 0 : memoryAllocatableCapacity - memoryLimits,
          ],
          backgroundColor: [
            "#3d90ce",
            defaultColor,
          ],
          id: "memoryLimits",
          label: "Limits",
        },
      ],
      labels: [
        `Usage: ${bytesToUnits(memoryUsage)}`,
        `Requests: ${bytesToUnits(memoryRequests)}`,
        `Limits: ${bytesToUnits(memoryLimits)}`,
        `Allocatable Capacity: ${bytesToUnits(memoryAllocatableCapacity)}`,
        `Capacity: ${bytesToUnits(memoryCapacity)}`,
      ],
    };
    const podsData: ChartData = {
      datasets: [
        {
          data: [
            podUsage,
            podUsage ? podAllocatableCapacity - podUsage : 1,
          ],
          backgroundColor: [
            "#4caf50",
            defaultColor,
          ],
          id: "podUsage",
          label: "Usage",
        },
      ],
      labels: [
        `Usage: ${podUsage || 0}`,
        `Capacity: ${podAllocatableCapacity}`,
      ],
    };

    return (
      <div className="flex justify-center box grow gaps">
        <div className={cssNames(styles.chart, "flex column align-center box grow")}>
          <PieChart
            data={cpuData}
            title="CPU"
            legendColors={[
              "#c93dce",
              "#4caf50",
              "#3d90ce",
              "#032b4d",
              defaultColor,
            ]}
          />
          {cpuLimitsOverload && renderLimitWarning()}
        </div>
        <div className={cssNames(styles.chart, "flex column align-center box grow")}>
          <PieChart
            data={memoryData}
            title="Memory"
            legendColors={[
              "#c93dce",
              "#4caf50",
              "#3d90ce",
              "#032b4d",
              defaultColor,
            ]}
          />
          {memoryLimitsOverload && renderLimitWarning()}
        </div>
        <div className={cssNames(styles.chart, "flex column align-center box grow")}>
          <PieChart
            data={podsData}
            title="Pods"
            legendColors={["#4caf50", defaultColor]}
          />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const nodes = metricsNodeRole === MetricNodeRole.MASTER ? masterNodes : workerNodes;

    if (!nodes.length) {
      return (
        <div className={cssNames(styles.empty, "flex column box grow align-center justify-center")}>
          <Icon material="info"/>
          No Nodes Available.
        </div>
      );
    }

    if (!metrics) {
      return (
        <div className={cssNames(styles.empty, "flex justify-center align-center box grow")}>
          <Spinner/>
        </div>
      );
    }

    const data = getMetricLastPoints(metrics);
    const { memoryCapacity, cpuCapacity, podCapacity } = data;

    if (!memoryCapacity || !cpuCapacity || !podCapacity) {
      return <ClusterNoMetrics className={styles.empty}/>;
    }

    return renderCharts(data);
  };

  return (
    <div className="flex">
      {renderContent()}
    </div>
  );
});

export const ClusterPieCharts = withInjectables<Dependencies, ClusterPieChartsProps>(NonInjectedClusterPieCharts, {
  getProps: (di, props) => ({
    activeTheme: di.inject(activeThemeInjectable),
    ...props,
  }),
});
