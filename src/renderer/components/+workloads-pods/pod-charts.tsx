/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { mapValues } from "lodash";
import { observer } from "mobx-react";
import React, { useContext } from "react";
import { isMetricsEmpty, normalizeMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import type { ChartDataSets } from "../chart";
import { BarChart } from "../chart";
import type { MetricsTab } from "../chart/options";
import { metricTabOptions } from "../chart/options";
import type { AtLeastOneMetricTab } from "../resource-metrics";
import { ResourceMetricsContext } from "../resource-metrics";
import { NoMetrics } from "../resource-metrics/no-metrics";

export const podMetricTabs: AtLeastOneMetricTab = [
  "CPU",
  "Memory",
  "Network",
  "Filesystem",
];

export const PodCharts = observer(() => {
  const { metrics, tab, object } = useContext(ResourceMetricsContext) ?? {};

  if (!metrics || !object || !tab) return null;
  if (isMetricsEmpty(metrics)) return <NoMetrics/>;

  const id = object.getId();
  const {
    cpuUsage,
    memoryUsage,
    fsUsage,
    fsWrites,
    fsReads,
    networkReceive,
    networkTransmit,
  } = mapValues(metrics, metric => normalizeMetrics(metric).data.result[0].values);

  const datasets: Partial<Record<MetricsTab, ChartDataSets[]>> = {
    CPU: [
      {
        id: `${id}-cpuUsage`,
        label: `Usage`,
        tooltip: `Container CPU cores usage`,
        borderColor: "#3D90CE",
        data: cpuUsage.map(([x, y]) => ({ x, y })),
      },
    ],
    Memory: [
      {
        id: `${id}-memoryUsage`,
        label: `Usage`,
        tooltip: `Container memory usage`,
        borderColor: "#c93dce",
        data: memoryUsage.map(([x, y]) => ({ x, y })),
      },
    ],
    Network: [
      {
        id: `${id}-networkReceive`,
        label: `Receive`,
        tooltip: `Bytes received by all containers`,
        borderColor: "#64c5d6",
        data: networkReceive.map(([x, y]) => ({ x, y })),
      },
      {
        id: `${id}-networkTransmit`,
        label: `Transmit`,
        tooltip: `Bytes transmitted from all containers`,
        borderColor: "#46cd9e",
        data: networkTransmit.map(([x, y]) => ({ x, y })),
      },
    ],
    Filesystem: [
      {
        id: `${id}-fsUsage`,
        label: `Usage`,
        tooltip: `Bytes consumed on this filesystem`,
        borderColor: "#ffc63d",
        data: fsUsage.map(([x, y]) => ({ x, y })),
      },
      {
        id: `${id}-fsWrites`,
        label: `Writes`,
        tooltip: `Bytes written on this filesystem`,
        borderColor: "#ff963d",
        data: fsWrites.map(([x, y]) => ({ x, y })),
      },
      {
        id: `${id}-fsReads`,
        label: `Reads`,
        tooltip: `Bytes read on this filesystem`,
        borderColor: "#fff73d",
        data: fsReads.map(([x, y]) => ({ x, y })),
      },
    ],
  };

  return (
    <BarChart
      name={`${object.getName()}-metric-${tab}`}
      options={metricTabOptions[tab]}
      data={{ datasets: datasets[tab] }}
    />
  );
});
