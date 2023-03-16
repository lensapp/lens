/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// import styles from "./cluster-pie-charts.module.scss";

import React from "react";
// import { observer } from "mobx-react";
// import type { ClusterOverviewStore } from "../cluster-overview-store/cluster-overview-store";
// import { MetricNodeRole } from "../cluster-overview-store/cluster-overview-store";
// import { Spinner } from "../../spinner";
// import { Icon } from "../../icon";
// import type { NodeStore } from "../../+nodes/store";
// import type { PieChartData } from "../../chart";
// import { PieChart } from "../../chart";
// import { ClusterNoMetrics } from "../cluster-no-metrics";
// import { bytesToUnits, cssNames } from "@k8slens/utilities";
// import type { LensTheme } from "../../../themes/lens-theme";
// import { getMetricLastPoints } from "../../../../common/k8s-api/endpoints/metrics.api";
// import { withInjectables } from "@ogre-tools/injectable-react";
// import clusterOverviewStoreInjectable from "../cluster-overview-store/cluster-overview-store.injectable";
// import nodeStoreInjectable from "../../+nodes/store.injectable";
// import type { IComputedValue } from "mobx";
// import activeThemeInjectable from "../../../themes/active.injectable";
// import type { ClusterMetricData } from "../../../../common/k8s-api/endpoints/metrics.api/request-cluster-metrics-by-node-names.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { clusterOverviewUIBlockInjectionToken } from "../cluster-overview-ui-block";

// function createLabels(rawLabelData: [string, number | undefined][]): string[] {
//   return rawLabelData.map(
//     ([key, value]) => `${key}: ${value?.toFixed(2) || "N/A"}`
//   );
// }
//
// const checkedBytesToUnits = (value: number | undefined) =>
//   typeof value === "number" ? bytesToUnits(value) : "N/A";
//
// interface Dependencies {
//   clusterOverviewStore: ClusterOverviewStore;
//   nodeStore: NodeStore;
//   activeTheme: IComputedValue<LensTheme>;
// }

// const NonInjectedClusterPieCharts = observer(
//   ({ clusterOverviewStore, nodeStore, activeTheme }: Dependencies) => {
//     const renderLimitWarning = () => {
//       return (
//         <div className="node-warning flex gaps align-center">
//           <Icon material="info" />
//           <p>Specified limits are higher than node capacity!</p>
//         </div>
//       );
//     };
//
//     const renderCharts = (
//       lastPoints: Partial<Record<keyof ClusterMetricData, number>>
//     ) => {
//       const {
//         memoryUsage,
//         memoryRequests,
//         memoryAllocatableCapacity,
//         memoryCapacity,
//         memoryLimits,
//         cpuUsage,
//         cpuRequests,
//         cpuAllocatableCapacity,
//         cpuCapacity,
//         cpuLimits,
//         podUsage,
//         podAllocatableCapacity,
//         podCapacity,
//       } = lastPoints;
//
//       if (
//         typeof cpuCapacity !== "number" ||
//         typeof cpuAllocatableCapacity !== "number" ||
//         typeof podCapacity !== "number" ||
//         typeof podAllocatableCapacity !== "number" ||
//         typeof memoryAllocatableCapacity !== "number" ||
//         typeof memoryCapacity !== "number" ||
//         typeof memoryUsage !== "number" ||
//         typeof memoryRequests !== "number"
//       ) {
//         return null;
//       }
//
//       const defaultColor = activeTheme.get().colors.pieChartDefaultColor;
//
//       const cpuData: PieChartData = {
//         datasets: [
//           {
//             data: [cpuUsage, cpuUsage ? cpuAllocatableCapacity - cpuUsage : 1],
//             backgroundColor: ["#c93dce", defaultColor],
//             id: "cpuUsage",
//             label: "Usage",
//           },
//           {
//             data: [
//               cpuRequests,
//               cpuRequests ? cpuAllocatableCapacity - cpuRequests : 1,
//             ],
//             backgroundColor: ["#4caf50", defaultColor],
//             id: "cpuRequests",
//             label: "Requests",
//           },
//           {
//             data: [
//               cpuLimits,
//               Math.max(
//                 0,
//                 cpuAllocatableCapacity - (cpuLimits ?? cpuAllocatableCapacity)
//               ),
//             ],
//             backgroundColor: ["#3d90ce", defaultColor],
//             id: "cpuLimits",
//             label: "Limits",
//           },
//         ],
//         labels: createLabels([
//           ["Usage", cpuUsage],
//           ["Requests", cpuRequests],
//           ["Limits", cpuLimits],
//           ["Allocatable Capacity", cpuAllocatableCapacity],
//           ["Capacity", cpuCapacity],
//         ]),
//       };
//       const memoryData: PieChartData = {
//         datasets: [
//           {
//             data: [
//               memoryUsage,
//               memoryUsage ? memoryAllocatableCapacity - memoryUsage : 1,
//             ],
//             backgroundColor: ["#c93dce", defaultColor],
//             id: "memoryUsage",
//             label: "Usage",
//           },
//           {
//             data: [
//               memoryRequests,
//               memoryRequests ? memoryAllocatableCapacity - memoryRequests : 1,
//             ],
//             backgroundColor: ["#4caf50", defaultColor],
//             id: "memoryRequests",
//             label: "Requests",
//           },
//           {
//             data: [
//               memoryLimits,
//               Math.max(
//                 0,
//                 memoryAllocatableCapacity -
//                   (memoryLimits ?? memoryAllocatableCapacity)
//               ),
//             ],
//             backgroundColor: ["#3d90ce", defaultColor],
//             id: "memoryLimits",
//             label: "Limits",
//           },
//         ],
//         labels: [
//           `Usage: ${bytesToUnits(memoryUsage)}`,
//           `Requests: ${bytesToUnits(memoryRequests)}`,
//           `Limits: ${checkedBytesToUnits(memoryLimits)}`,
//           `Allocatable Capacity: ${bytesToUnits(memoryAllocatableCapacity)}`,
//           `Capacity: ${bytesToUnits(memoryCapacity)}`,
//         ],
//       };
//       const podsData: PieChartData = {
//         datasets: [
//           {
//             data: [podUsage, podUsage ? podAllocatableCapacity - podUsage : 1],
//             backgroundColor: ["#4caf50", defaultColor],
//             id: "podUsage",
//             label: "Usage",
//             tooltipLabels: [
//               (percent) => `Usage: ${percent}`,
//               (percent) => `Available: ${percent}`,
//             ],
//           },
//         ],
//         labels: [
//           `Usage: ${podUsage || 0}`,
//           `Capacity: ${podAllocatableCapacity}`,
//         ],
//       };
//
//       return (
//         <div className="flex justify-center box grow gaps">
//           <div
//             className={cssNames(
//               styles.chart,
//               "flex column align-center box grow"
//             )}
//           >
//             <PieChart
//               data={cpuData}
//               title="CPU"
//               legendColors={[
//                 "#c93dce",
//                 "#4caf50",
//                 "#3d90ce",
//                 "#032b4d",
//                 defaultColor,
//               ]}
//             />
//             {(cpuLimits ?? cpuAllocatableCapacity) > cpuAllocatableCapacity &&
//               renderLimitWarning()}
//           </div>
//           <div
//             className={cssNames(
//               styles.chart,
//               "flex column align-center box grow"
//             )}
//           >
//             <PieChart
//               data={memoryData}
//               title="Memory"
//               legendColors={[
//                 "#c93dce",
//                 "#4caf50",
//                 "#3d90ce",
//                 "#032b4d",
//                 defaultColor,
//               ]}
//             />
//             {(memoryLimits ?? memoryAllocatableCapacity) >
//               memoryAllocatableCapacity && renderLimitWarning()}
//           </div>
//           <div
//             className={cssNames(
//               styles.chart,
//               "flex column align-center box grow"
//             )}
//           >
//             <PieChart
//               data={podsData}
//               title="Pods"
//               legendColors={["#4caf50", defaultColor]}
//             />
//           </div>
//         </div>
//       );
//     };
//
//     const renderContent = ({
//       metricNodeRole,
//       metrics,
//     }: ClusterOverviewStore) => {
//       const { masterNodes, workerNodes } = nodeStore;
//       const nodes =
//         metricNodeRole === MetricNodeRole.MASTER ? masterNodes : workerNodes;
//
//       if (!nodes.length) {
//         return (
//           <div
//             className={cssNames(
//               styles.empty,
//               "flex column box grow align-center justify-center"
//             )}
//           >
//             <Icon material="info" />
//             No Nodes Available.
//           </div>
//         );
//       }
//
//       if (!metrics) {
//         return (
//           <div
//             className={cssNames(
//               styles.empty,
//               "flex justify-center align-center box grow"
//             )}
//           >
//             <Spinner />
//           </div>
//         );
//       }
//
//       const lastPoints = getMetricLastPoints(metrics);
//       const { memoryCapacity, cpuCapacity, podCapacity } = lastPoints;
//
//       if (!memoryCapacity || !cpuCapacity || !podCapacity) {
//         return (
//           <div className={styles.noMetrics}>
//             <ClusterNoMetrics className={styles.empty} />
//           </div>
//         );
//       }
//
//       return renderCharts(lastPoints);
//     };
//
//     return <div className="flex">{renderContent(clusterOverviewStore)}</div>;
//   }
// );

// const ClusterPieCharts = withInjectables<Dependencies>(
//   NonInjectedClusterPieCharts,
//   {
//     getProps: (di) => ({
//       clusterOverviewStore: di.inject(clusterOverviewStoreInjectable),
//       nodeStore: di.inject(nodeStoreInjectable),
//       activeTheme: di.inject(activeThemeInjectable),
//     }),
//   }
// );

const ClusterPieCharts = () => <div>cluster-pie-charts.injectable</div>;

const clusterPieChartsClusterOverviewInjectable = getInjectable({
  id: "cluster-pie-charts-cluster-overview",

  instantiate: (di) => ({
    id: "cluster-pie-charts-cluster-overview",
    Component: ClusterPieCharts,
  }),

  injectionToken: clusterOverviewUIBlockInjectionToken,
});

export default clusterPieChartsClusterOverviewInjectable;
