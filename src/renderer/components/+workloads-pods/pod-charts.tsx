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

import { observer } from "mobx-react";
import React, { useContext } from "react";
import { FlattenedMetrics, flattenMatricResults, isMetricsEmpty } from "../../../common/k8s-api/endpoints/metrics.api";
import { BarChart, ChartDataSets } from "../chart";
import { ResourceMetricsContext } from "../resource-metrics";
import { NoMetrics } from "../resource-metrics/no-metrics";
import type { IPodMetrics } from "../../../common/k8s-api/endpoints";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { getBarChartOptions, PodMetricsTab } from "../metrics-helpers";

function getDatasets(object: KubeObject, tab: string, metrics: FlattenedMetrics<IPodMetrics>): ChartDataSets[] | null {
  const id = object.getId();
  const {
    cpuUsage,
    memoryUsage,
    networkReceive,
    networkTransmit,
    fsUsage,
  } = metrics;

  switch (tab) {
    case PodMetricsTab.CPU:
      return [
        {
          id: `${id}-cpuUsage`,
          label: "Usage",
          tooltip: "Container CPU cores usage",
          borderColor: "#3D90CE",
          data: cpuUsage.map(([x, y]) => ({ x, y }))
        }
      ];
    case PodMetricsTab.MEMORY:
      return [
        {
          id: `${id}-memoryUsage`,
          label: "Usage",
          tooltip: "Container memory usage",
          borderColor: "#c93dce",
          data: memoryUsage.map(([x, y]) => ({ x, y }))
        },
      ];
    case PodMetricsTab.NETWORK:
      return [
        {
          id: `${id}-networkReceive`,
          label: "Receive",
          tooltip: "Bytes received by all containers",
          borderColor: "#64c5d6",
          data: networkReceive.map(([x, y]) => ({ x, y }))
        },
        {
          id: `${id}-networkTransmit`,
          label: "Transmit",
          tooltip: "Bytes transmitted from all containers",
          borderColor: "#46cd9e",
          data: networkTransmit.map(([x, y]) => ({ x, y }))
        }
      ];
    case PodMetricsTab.FILESYSTEM:
      return [
        {
          id: `${id}-fsUsage`,
          label: "Usage",
          tooltip: "Bytes consumed on this filesystem",
          borderColor: "#ffc63d",
          data: fsUsage.map(([x, y]) => ({ x, y }))
        }
      ];
    default:
      return null;
  }
}

export const PodCharts = observer(() => {
  const { metrics, tab, object } = useContext(ResourceMetricsContext);

  if (isMetricsEmpty(metrics)) {
    return <NoMetrics />;
  }

  const datasets = getDatasets(object, tab, flattenMatricResults(metrics as IPodMetrics));

  if (!datasets) {
    return <NoMetrics />;
  }

  return (
    <BarChart
      name={`${object.getName()}-metric-${tab}`}
      options={getBarChartOptions(tab)}
      data={{ datasets }}
    />
  );
});
