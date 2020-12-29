import "./cluster-pie-charts.scss";

import React from "react";
import { observer } from "mobx-react";
import { clusterOverviewStore, MetricNodeRole } from "./cluster-overview.store";
import { Spinner } from "../spinner";
import { Icon } from "../icon";
import { nodesStore } from "../+nodes/nodes.store";
import { ChartData, PieChart } from "../chart";
import { ClusterNoMetrics } from "./cluster-no-metrics";
import { bytesToUnits } from "../../utils";
import { themeStore } from "../../theme.store";
import { getMetricLastPoints } from "../../api/endpoints/metrics.api";

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
    const { memoryUsage, memoryRequests, memoryCapacity, memoryLimits } = data;
    const { cpuUsage, cpuRequests, cpuCapacity, cpuLimits } = data;
    const { podUsage, podCapacity } = data;
    const cpuLimitsOverload = cpuLimits > cpuCapacity;
    const memoryLimitsOverload = memoryLimits > memoryCapacity;
    const defaultColor = themeStore.activeTheme.colors.pieChartDefaultColor;

    if (!memoryCapacity || !cpuCapacity || !podCapacity) return null;
    const cpuData: ChartData = {
      datasets: [
        {
          data: [
            cpuUsage,
            cpuUsage ? cpuCapacity - cpuUsage : 1,
          ],
          backgroundColor: [
            "#c93dce",
            defaultColor,
          ],
          id: "cpuUsage"
        },
        {
          data: [
            cpuRequests,
            cpuRequests ? cpuCapacity - cpuRequests : 1,
          ],
          backgroundColor: [
            "#4caf50",
            defaultColor,
          ],
          id: "cpuRequests"
        },
        {
          data: [
            cpuLimits,
            cpuLimitsOverload ? 0 : cpuCapacity - cpuLimits,
          ],
          backgroundColor: [
            "#3d90ce",
            defaultColor,
          ],
          id: "cpuLimits"
        },
      ],
      labels: [
        `Usage: ${cpuUsage ? cpuUsage.toFixed(2) : "N/A"}`,
        `Requests: ${cpuRequests ? cpuRequests.toFixed(2) : "N/A"}`,
        `Limits: ${cpuLimits ? cpuLimits.toFixed(2) : "N/A"}`,
        `Capacity: ${cpuCapacity || "N/A"}`
      ]
    };
    const memoryData: ChartData = {
      datasets: [
        {
          data: [
            memoryUsage,
            memoryUsage ? memoryCapacity - memoryUsage : 1,
          ],
          backgroundColor: [
            "#c93dce",
            defaultColor,
          ],
          id: "memoryUsage"
        },
        {
          data: [
            memoryRequests,
            memoryRequests ? memoryCapacity - memoryRequests : 1,
          ],
          backgroundColor: [
            "#4caf50",
            defaultColor,
          ],
          id: "memoryRequests"
        },
        {
          data: [
            memoryLimits,
            memoryLimitsOverload ? 0 : memoryCapacity - memoryLimits,
          ],
          backgroundColor: [
            "#3d90ce",
            defaultColor,
          ],
          id: "memoryLimits"
        },
      ],
      labels: [
        `Usage: ${bytesToUnits(memoryUsage)}`,
        `Requests: ${bytesToUnits(memoryRequests)}`,
        `Limits: ${bytesToUnits(memoryLimits)}`,
        `Capacity: ${bytesToUnits(memoryCapacity)}`,
      ]
    };
    const podsData: ChartData = {
      datasets: [
        {
          data: [
            podUsage,
            podUsage ? podCapacity - podUsage : 1,
          ],
          backgroundColor: [
            "#4caf50",
            defaultColor,
          ],
          id: "podUsage"
        },
      ],
      labels: [
        `Usage: ${podUsage || 0}`,
        `Capacity: ${podCapacity}`,
      ]
    };

    return (
      <div className="NodeCharts flex justify-center box grow gaps">
        <div className="chart flex column align-center box grow">
          <PieChart
            data={cpuData}
            title={`CPU`}
            legendColors={["#c93dce", "#4caf50", "#3d90ce", defaultColor]}
          />
          {cpuLimitsOverload && renderLimitWarning()}
        </div>
        <div className="chart flex column align-center box grow">
          <PieChart
            data={memoryData}
            title={`Memory`}
            legendColors={["#c93dce", "#4caf50", "#3d90ce", defaultColor]}
          />
          {memoryLimitsOverload && renderLimitWarning()}
        </div>
        <div className="chart flex column align-center box grow">
          <PieChart
            data={podsData}
            title={`Pods`}
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
        <div className="empty flex column box grow align-center justify-center">
          <Icon material="info"/>
          No Nodes Available.
        </div>
      );
    }

    if (!metricsLoaded) {
      return (
        <div className="flex justify-center align-center box grow empty">
          <Spinner/>
        </div>
      );
    }
    const { memoryCapacity, cpuCapacity, podCapacity } = getMetricLastPoints(clusterOverviewStore.metrics);

    if (!memoryCapacity || !cpuCapacity || !podCapacity) {
      return <ClusterNoMetrics className="empty"/>;
    }

    return renderCharts();
  };

  return (
    <div className="ClusterPieCharts flex">
      {renderContent()}
    </div>
  );
});
