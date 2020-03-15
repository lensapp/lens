import "./cluster-pie-charts.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { clusterStore, MetricNodeRole } from "./cluster.store";
import { Spinner } from "../spinner";
import { Icon } from "../icon";
import { nodesStore } from "../+nodes/nodes.store";
import { ChartData, PieChart } from "../chart";
import { ClusterNoMetrics } from "./cluster-no-metrics";
import { bytesToUnits } from "../../utils";
import { themeStore } from "../../theme.store";
import { getMetricLastPoints } from "../../api/endpoints/metrics.api";

export const ClusterPieCharts = observer(() => {
  const { i18n } = useLingui();

  const renderLimitWarning = () => {
    return (
      <div className="node-warning flex gaps align-center">
        <Icon material="info"/>
        <p><Trans>Specified limits are higher than node capacity!</Trans></p>
      </div>
    );
  }

  const renderCharts = () => {
    const data = getMetricLastPoints(clusterStore.metrics);
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
        i18n._(t`Usage`) + `: ${cpuUsage ? cpuUsage.toFixed(2) : "N/A"}`,
        i18n._(t`Requests`) + `: ${cpuRequests ? cpuRequests.toFixed(2) : "N/A"}`,
        i18n._(t`Limits`) + `: ${cpuLimits ? cpuLimits.toFixed(2) : "N/A"}`,
        i18n._(t`Capacity`) + `: ${cpuCapacity || "N/A"}`
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
        i18n._(t`Usage`) + `: ${bytesToUnits(memoryUsage)}`,
        i18n._(t`Requests`) + `: ${bytesToUnits(memoryRequests)}`,
        i18n._(t`Limits`) + `: ${bytesToUnits(memoryLimits)}`,
        i18n._(t`Capacity`) + `: ${bytesToUnits(memoryCapacity)}`,
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
        i18n._(t`Usage`) + `: ${podUsage || 0}`,
        i18n._(t`Capacity`) + `: ${podCapacity}`,
      ]
    };
    return (
      <div className="NodeCharts flex justify-center box grow gaps">
        <div className="chart flex column align-center box grow">
          <PieChart
            data={cpuData}
            title={i18n._(t`CPU`)}
            legendColors={["#c93dce", "#4caf50", "#3d90ce", defaultColor]}
          />
          {cpuLimitsOverload && renderLimitWarning()}
        </div>
        <div className="chart flex column align-center box grow">
          <PieChart
            data={memoryData}
            title={i18n._(t`Memory`)}
            legendColors={["#c93dce", "#4caf50", "#3d90ce", defaultColor]}
          />
          {memoryLimitsOverload && renderLimitWarning()}
        </div>
        <div className="chart flex column align-center box grow">
          <PieChart
            data={podsData}
            title={i18n._(t`Pods`)}
            legendColors={["#4caf50", defaultColor]}
          />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const { masterNodes, workerNodes } = nodesStore;
    const { metricNodeRole, metricsLoaded } = clusterStore;
    const nodes = metricNodeRole === MetricNodeRole.MASTER ? masterNodes : workerNodes;
    if (!nodes.length) {
      return (
        <div className="empty flex column box grow align-center justify-center">
          <Icon material="info"/>
          <Trans>No Nodes Available.</Trans>
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
    const { memoryCapacity, cpuCapacity, podCapacity } = getMetricLastPoints(clusterStore.metrics);
    if (!memoryCapacity || !cpuCapacity || !podCapacity) {
      return <ClusterNoMetrics className="empty"/>;
    }
    return renderCharts();
  }

  return (
    <div className="ClusterPieCharts flex">
      {renderContent()}
    </div>
  );
})