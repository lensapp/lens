import React, { useContext } from "react";
import { t, Trans } from "@lingui/macro";
import { observer } from "mobx-react";
import { IPodMetrics } from "../../api/endpoints";
import { BarChart, cpuOptions, memoryOptions } from "../chart";
import { isMetricsEmpty, normalizeMetrics } from "../../api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { IResourceMetricsValue, ResourceMetricsContext } from "../resource-metrics";
import { _i18n } from "../../i18n";
import { WorkloadKubeObject } from "../../api/workload-kube-object";
import { themeStore } from "../../theme.store";

export const podMetricTabs = [
  <Trans>CPU</Trans>,
  <Trans>Memory</Trans>,
  <Trans>Network</Trans>,
  <Trans>Filesystem</Trans>,
];

type IContext = IResourceMetricsValue<WorkloadKubeObject, { metrics: IPodMetrics }>;

export const PodCharts = observer(() => {
  const { params: { metrics }, tabId, object } = useContext<IContext>(ResourceMetricsContext);
  const { chartCapacityColor } = themeStore.activeTheme.colors;
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
        label: _i18n._(t`Usage`),
        tooltip: _i18n._(t`Container CPU cores usage`),
        borderColor: "#3D90CE",
        data: cpuUsage.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-cpuRequests`,
        label: _i18n._(t`Requests`),
        tooltip: _i18n._(t`Container CPU requests`),
        borderColor: "#30b24d",
        data: cpuRequests.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-cpuLimits`,
        label: _i18n._(t`Limits`),
        tooltip: _i18n._(t`CPU limits`),
        borderColor: chartCapacityColor,
        data: cpuLimits.map(([x, y]) => ({ x, y }))
      }
    ],
    // Memory
    [
      {
        id: `${id}-memoryUsage`,
        label: _i18n._(t`Usage`),
        tooltip: _i18n._(t`Container memory usage`),
        borderColor: "#c93dce",
        data: memoryUsage.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-memoryRequests`,
        label: _i18n._(t`Requests`),
        tooltip: _i18n._(t`Container memory requests`),
        borderColor: "#30b24d",
        data: memoryRequests.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-memoryLimits`,
        label: _i18n._(t`Limits`),
        tooltip: _i18n._(t`Container memory limits`),
        borderColor: chartCapacityColor,
        data: memoryLimits.map(([x, y]) => ({ x, y }))
      }
    ],
    // Network
    [
      {
        id: `${id}-networkReceive`,
        label: _i18n._(t`Receive`),
        tooltip: _i18n._(t`Bytes received by all containers`),
        borderColor: "#64c5d6",
        data: networkReceive.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-networkTransmit`,
        label: _i18n._(t`Transmit`),
        tooltip: _i18n._(t`Bytes transmitted from all containers`),
        borderColor: "#46cd9e",
        data: networkTransmit.map(([x, y]) => ({ x, y }))
      }
    ],
    // Filesystem
    [
      {
        id: `${id}-fsUsage`,
        label: _i18n._(t`Usage`),
        tooltip: _i18n._(t`Bytes consumed on this filesystem`),
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