import React, { useContext } from "react";
import { observer } from "mobx-react";
import { IPodMetrics } from "../../api/endpoints";
import { BarChart, cpuOptions, memoryOptions } from "../chart";
import { isMetricsEmpty, normalizeMetrics } from "../../api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { IResourceMetricsValue, ResourceMetricsContext } from "../resource-metrics";
import { ThemeStore } from "../../theme.store";

type IContext = IResourceMetricsValue<any, { metrics: IPodMetrics }>;

export const ContainerCharts = observer(() => {
  const { params: { metrics }, tabId } = useContext<IContext>(ResourceMetricsContext);
  const { chartCapacityColor } = ThemeStore.getInstance().activeTheme.colors;

  if (!metrics) return null;
  if (isMetricsEmpty(metrics)) return <NoMetrics/>;

  const values = Object.values(metrics)
    .map(normalizeMetrics)
    .map(({ data }) => data.result[0].values);
  const [
    cpuUsage,
    cpuRequests,
    cpuLimits,
    memoryUsage,
    memoryRequests,
    memoryLimits,
    fsUsage
  ] = values;

  const datasets = [
    // CPU
    [
      {
        id: "cpuUsage",
        label: `Usage`,
        tooltip: `CPU cores usage`,
        borderColor: "#3D90CE",
        data: cpuUsage.map(([x, y]) => ({ x, y }))
      },
      {
        id: "cpuRequests",
        label: `Requests`,
        tooltip: `CPU requests`,
        borderColor: "#30b24d",
        data: cpuRequests.map(([x, y]) => ({ x, y }))
      },
      {
        id: "cpuLimits",
        label: `Limits`,
        tooltip: `CPU limits`,
        borderColor: chartCapacityColor,
        data: cpuLimits.map(([x, y]) => ({ x, y }))
      }
    ],
    // Memory
    [
      {
        id: "memoryUsage",
        label: `Usage`,
        tooltip: `Memory usage`,
        borderColor: "#c93dce",
        data: memoryUsage.map(([x, y]) => ({ x, y }))
      },
      {
        id: "memoryRequests",
        label: `Requests`,
        tooltip: `Memory requests`,
        borderColor: "#30b24d",
        data: memoryRequests.map(([x, y]) => ({ x, y }))
      },
      {
        id: "memoryLimits",
        label: `Limits`,
        tooltip: `Memory limits`,
        borderColor: chartCapacityColor,
        data: memoryLimits.map(([x, y]) => ({ x, y }))
      }
    ],
    // Filesystem
    [
      {
        id: "fsUsage",
        label: `Usage`,
        tooltip: `Bytes consumed on this filesystem`,
        borderColor: "#ffc63d",
        data: fsUsage.map(([x, y]) => ({ x, y }))
      }
    ]
  ];

  const options = tabId == 0 ? cpuOptions : memoryOptions;

  return (
    <BarChart
      name={`metrics-${tabId}`}
      options={options}
      data={{ datasets: datasets[tabId] }}
    />
  );
});
