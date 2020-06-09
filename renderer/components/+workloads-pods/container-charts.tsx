import React, { useContext } from "react";
import { t } from "@lingui/macro";
import { IPodMetrics } from "../../api/endpoints";
import { BarChart, cpuOptions, memoryOptions } from "../chart";
import { isMetricsEmpty, normalizeMetrics } from "../../api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { IResourceMetricsValue, ResourceMetricsContext } from "../resource-metrics";
import { _i18n } from "../../i18n";
import { themeStore } from "../../theme.store";

type IContext = IResourceMetricsValue<any, { metrics: IPodMetrics }>;

export const ContainerCharts = () => {
  const { params: { metrics }, tabId } = useContext<IContext>(ResourceMetricsContext);
  const { chartCapacityColor } = themeStore.activeTheme.colors;

  if (!metrics) return null;
  if (isMetricsEmpty(metrics)) return <NoMetrics/>;

  const values = Object.values(metrics).map(metric =>
    normalizeMetrics(metric).data.result[0].values
  );
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
        label: _i18n._(t`Usage`),
        tooltip: _i18n._(t`CPU cores usage`),
        borderColor: "#3D90CE",
        data: cpuUsage.map(([x, y]) => ({ x, y }))
      },
      {
        id: "cpuRequests",
        label: _i18n._(t`Requests`),
        tooltip: _i18n._(t`CPU requests`),
        borderColor: "#30b24d",
        data: cpuRequests.map(([x, y]) => ({ x, y }))
      },
      {
        id: "cpuLimits",
        label: _i18n._(t`Limits`),
        tooltip: _i18n._(t`CPU limits`),
        borderColor: chartCapacityColor,
        data: cpuLimits.map(([x, y]) => ({ x, y }))
      }
    ],
    // Memory
    [
      {
        id: "memoryUsage",
        label: _i18n._(t`Usage`),
        tooltip: _i18n._(t`Memory usage`),
        borderColor: "#c93dce",
        data: memoryUsage.map(([x, y]) => ({ x, y }))
      },
      {
        id: "memoryRequests",
        label: _i18n._(t`Requests`),
        tooltip: _i18n._(t`Memory requests`),
        borderColor: "#30b24d",
        data: memoryRequests.map(([x, y]) => ({ x, y }))
      },
      {
        id: "memoryLimits",
        label: _i18n._(t`Limits`),
        tooltip: _i18n._(t`Memory limits`),
        borderColor: chartCapacityColor,
        data: memoryLimits.map(([x, y]) => ({ x, y }))
      }
    ],
    // Filesystem
    [
      {
        id: "fsUsage",
        label: _i18n._(t`Usage`),
        tooltip: _i18n._(t`Bytes consumed on this filesystem`),
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
}