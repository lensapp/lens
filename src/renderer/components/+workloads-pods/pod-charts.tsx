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

import { mapValues } from "lodash";
import { observer } from "mobx-react";
import React, { useContext } from "react";
import { isMetricsEmpty, normalizeMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import { BarChart, cpuOptions, memoryOptions } from "../chart";
import { IResourceMetricsValue, ResourceMetricsContext } from "../resource-metrics";
import { NoMetrics } from "../resource-metrics/no-metrics";

import type { WorkloadKubeObject } from "../../../common/k8s-api/workload-kube-object";
import type { IPodMetrics } from "../../../common/k8s-api/endpoints";

export const podMetricTabs = [
  "CPU",
  "Memory",
  "Network",
  "Filesystem",
];

type IContext = IResourceMetricsValue<WorkloadKubeObject, { metrics: IPodMetrics }>;

export const PodCharts = observer(() => {
  const { params: { metrics }, tabId, object } = useContext<IContext>(ResourceMetricsContext);
  const id = object.getId();

  if (!metrics) return null;
  if (isMetricsEmpty(metrics)) return <NoMetrics/>;

  const options = tabId == 0 ? cpuOptions : memoryOptions;
  const {
    cpuUsage,
    memoryUsage,
    fsUsage,
    networkReceive,
    networkTransmit,
  } = mapValues(metrics, metric => normalizeMetrics(metric).data.result[0].values);

  const datasets = [
    // CPU
    [
      {
        id: `${id}-cpuUsage`,
        label: `Usage`,
        tooltip: `Container CPU cores usage`,
        borderColor: "#3D90CE",
        data: cpuUsage.map(([x, y]) => ({ x, y })),
      },
    ],
    // Memory
    [
      {
        id: `${id}-memoryUsage`,
        label: `Usage`,
        tooltip: `Container memory usage`,
        borderColor: "#c93dce",
        data: memoryUsage.map(([x, y]) => ({ x, y })),
      },
    ],
    // Network
    [
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
    // Filesystem
    [
      {
        id: `${id}-fsUsage`,
        label: `Usage`,
        tooltip: `Bytes consumed on this filesystem`,
        borderColor: "#ffc63d",
        data: fsUsage.map(([x, y]) => ({ x, y })),
      },
    ],
  ];

  return (
    <BarChart
      name={`${object.getName()}-metric-${tabId}`}
      options={options}
      data={{ datasets: datasets[tabId] }}
    />
  );
});
