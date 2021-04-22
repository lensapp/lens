import React, { useContext } from "react";
import { observer } from "mobx-react";
import { IPodMetrics } from "../../api/endpoints";
import { BarChart, cpuOptions, memoryOptions } from "../chart";
import { isMetricsEmpty, normalizeMetrics } from "../../api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { IResourceMetricsValue, ResourceMetricsContext } from "../resource-metrics";
import { WorkloadKubeObject } from "../../api/workload-kube-object";
import { ThemeStore } from "../../theme.store";

export const podMetricTabs = [
  "CPU",
  "Memory",
  "Network",
  "Filesystem",
];

type IContext = IResourceMetricsValue<WorkloadKubeObject, { metrics: IPodMetrics }>;

export const PodCharts = observer(() => {
  const { params: { metrics }, tabId, object } = useContext<IContext>(ResourceMetricsContext);
  const { chartCapacityColor } = ThemeStore.getInstance().activeTheme.colors;
  const id = object.getId();

  if (!metrics) return null;
  if (isMetricsEmpty(metrics)) return <NoMetrics/>;

  const options = tabId == 0 ? cpuOptions : memoryOptions;
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
    fsUsage,
    networkReceive,
    networkTransmit
  ] = values;

  const datasets = [
    // CPU
    [
      {
        id: `${id}-cpuUsage`,
        label: `Usage`,
        tooltip: `Container CPU cores usage`,
        borderColor: "#3D90CE",
        data: cpuUsage.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-cpuRequests`,
        label: `Requests`,
        tooltip: `Container CPU requests`,
        borderColor: "#30b24d",
        data: cpuRequests.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-cpuLimits`,
        label: `Limits`,
        tooltip: `CPU limits`,
        borderColor: chartCapacityColor,
        data: cpuLimits.map(([x, y]) => ({ x, y }))
      }
    ],
    // Memory
    [
      {
        id: `${id}-memoryUsage`,
        label: `Usage`,
        tooltip: `Container memory usage`,
        borderColor: "#c93dce",
        data: memoryUsage.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-memoryRequests`,
        label: `Requests`,
        tooltip: `Container memory requests`,
        borderColor: "#30b24d",
        data: memoryRequests.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-memoryLimits`,
        label: `Limits`,
        tooltip: `Container memory limits`,
        borderColor: chartCapacityColor,
        data: memoryLimits.map(([x, y]) => ({ x, y }))
      }
    ],
    // Network
    [
      {
        id: `${id}-networkReceive`,
        label: `Receive`,
        tooltip: `Bytes received by all containers`,
        borderColor: "#64c5d6",
        data: networkReceive.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-networkTransmit`,
        label: `Transmit`,
        tooltip: `Bytes transmitted from all containers`,
        borderColor: "#46cd9e",
        data: networkTransmit.map(([x, y]) => ({ x, y }))
      }
    ],
    // Filesystem
    [
      {
        id: `${id}-fsUsage`,
        label: `Usage`,
        tooltip: `Bytes consumed on this filesystem`,
        borderColor: "#ffc63d",
        data: fsUsage.map(([x, y]) => ({ x, y }))
      }
    ]
  ];

  return (
    <BarChart
      name={`${object.getName()}-metric-${tabId}`}
      options={options}
      data={{ datasets: datasets[tabId] }}
    />
  );
});
