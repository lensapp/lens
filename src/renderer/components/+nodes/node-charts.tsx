import React, { useContext } from "react";
import { IClusterMetrics, Node } from "../../api/endpoints";
import { BarChart, cpuOptions, memoryOptions } from "../chart";
import { isMetricsEmpty, normalizeMetrics } from "../../api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { IResourceMetricsValue, ResourceMetricsContext } from "../resource-metrics";
import { observer } from "mobx-react";
import { ChartOptions, ChartPoint } from "chart.js";
import { themeStore } from "../../theme.store";
import { mapValues } from "lodash";

type IContext = IResourceMetricsValue<Node, { metrics: IClusterMetrics }>;

export const NodeCharts = observer(() => {
  const { params: { metrics }, tabId, object } = useContext<IContext>(ResourceMetricsContext);
  const id = object.getId();
  const { chartCapacityColor } = themeStore.activeTheme.colors;

  if (!metrics) {
    return null;
  }

  if (isMetricsEmpty(metrics)) {
    return <NoMetrics />;
  }

  const {
    memoryUsage,
    memoryRequests,
    memoryCapacity,
    cpuUsage,
    cpuRequests,
    cpuCapacity,
    podUsage,
    podCapacity,
    fsSize,
    fsUsage
  } = mapValues(metrics, metric => normalizeMetrics(metric).data.result[0].values);

  const datasets = [
    // CPU
    [
      {
        id: `${id}-cpuUsage`,
        label: `Usage`,
        tooltip: `CPU cores usage`,
        borderColor: "#3D90CE",
        data: cpuUsage.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-cpuRequests`,
        label: `Requests`,
        tooltip: `CPU requests`,
        borderColor: "#30b24d",
        data: cpuRequests.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-cpuCapacity`,
        label: `Capacity`,
        tooltip: `CPU capacity`,
        borderColor: chartCapacityColor,
        data: cpuCapacity.map(([x, y]) => ({ x, y }))
      }
    ],
    // Memory
    [
      {
        id: `${id}-memoryUsage`,
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
        id: `${id}-memoryCapacity`,
        label: `Capacity`,
        tooltip: `Memory capacity`,
        borderColor: chartCapacityColor,
        data: memoryCapacity.map(([x, y]) => ({ x, y }))
      }
    ],
    // Disk
    [
      {
        id: `${id}-fsUsage`,
        label: `Usage`,
        tooltip: `Node filesystem usage in bytes`,
        borderColor: "#ffc63d",
        data: fsUsage.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-fsSize`,
        label: `Size`,
        tooltip: `Node filesystem size in bytes`,
        borderColor: chartCapacityColor,
        data: fsSize.map(([x, y]) => ({ x, y }))
      }
    ],
    // Pods
    [
      {
        id: `${id}-podUsage`,
        label: `Usage`,
        tooltip: `Number of running Pods`,
        borderColor: "#30b24d",
        data: podUsage.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-podCapacity`,
        label: `Capacity`,
        tooltip: `Node Pods capacity`,
        borderColor: chartCapacityColor,
        data: podCapacity.map(([x, y]) => ({ x, y }))
      }
    ]
  ];

  const podOptions: ChartOptions = {
    scales: {
      yAxes: [{
        ticks: {
          callback: value => value
        }
      }]
    },
    tooltips: {
      callbacks: {
        label: ({ datasetIndex, index }, { datasets }) => {
          const { label, data } = datasets[datasetIndex];
          const value = data[index] as ChartPoint;

          return `${label}: ${value.y}`;
        }
      }
    }
  };

  const options = [cpuOptions, memoryOptions, memoryOptions, podOptions];

  return (
    <BarChart
      name={`${object.getName()}-metric-${tabId}`}
      options={options[tabId]}
      data={{ datasets: datasets[tabId] }}
    />
  );
});
