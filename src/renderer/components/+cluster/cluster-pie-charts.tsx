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

import styles from "./cluster-pie-charts.module.css";

import React from "react";
import { observer } from "mobx-react";
import { clusterOverviewStore, MetricNodeRole } from "./cluster-overview.store";
import { Spinner } from "../spinner";
import { Icon } from "../icon";
import { nodesStore } from "../+nodes/nodes.store";
import { ChartData, PieChart } from "../chart";
import { ClusterNoMetrics } from "./cluster-no-metrics";
import { bytesToUnits, cssNames } from "../../utils";
import { ThemeStore } from "../../theme.store";
import { getMetricLastPoints } from "../../../common/k8s-api/endpoints/metrics.api";

function createLabels(rawLabelData: [string, number | undefined][]): string[] {
  return rawLabelData.map(([key, value]) => `${key}: ${value?.toFixed(2) || "N/A"}`);
}

export const ClusterPieCharts = observer(() => {
  const renderLimitWarning = () => {
    return (
      <div className="node-warning flex gaps align-center">
        <Icon material="info"/>
        <p>Specified limits are higher than node capacity!</p>
      </div>
    );
  };

  const renderCharts = () => {
    const data = getMetricLastPoints(clusterOverviewStore.metrics);
    const { memoryUsage, memoryRequests, memoryAllocatableCapacity, memoryCapacity, memoryLimits } = data;
    const { cpuUsage, cpuRequests, cpuAllocatableCapacity, cpuCapacity, cpuLimits } = data;
    const { podUsage, podAllocatableCapacity, podCapacity } = data;
    const cpuLimitsOverload = cpuLimits > cpuAllocatableCapacity;
    const memoryLimitsOverload = memoryLimits > memoryAllocatableCapacity;
    const defaultColor = ThemeStore.getInstance().activeTheme.colors.pieChartDefaultColor;

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
    const { masterNodes, workerNodes } = nodesStore;
    const { metricNodeRole, metricsLoaded } = clusterOverviewStore;
    const nodes = metricNodeRole === MetricNodeRole.MASTER ? masterNodes : workerNodes;

    if (!nodes.length) {
      return (
        <div className={cssNames(styles.empty, "flex column box grow align-center justify-center")}>
          <Icon material="info"/>
          No Nodes Available.
        </div>
      );
    }

    if (!metricsLoaded) {
      return (
        <div className={cssNames(styles.empty, "flex justify-center align-center box grow")}>
          <Spinner/>
        </div>
      );
    }
    const { memoryCapacity, cpuCapacity, podCapacity } = getMetricLastPoints(clusterOverviewStore.metrics);

    if (!memoryCapacity || !cpuCapacity || !podCapacity) {
      return <ClusterNoMetrics className={styles.empty}/>;
    }

    return renderCharts();
  };

  return (
    <div className="flex">
      {renderContent()}
    </div>
  );
});
