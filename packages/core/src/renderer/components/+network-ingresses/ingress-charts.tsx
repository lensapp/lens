/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useContext } from "react";
import { observer } from "mobx-react";
import type { ChartDataSets } from "../chart";
import { BarChart } from "../chart";
import { normalizeMetrics, isMetricsEmpty } from "../../../common/k8s-api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { ResourceMetricsContext } from "../resource-metrics";
import { type MetricsTab, metricTabOptions } from "../chart/options";

export const IngressCharts = observer(() => {
  const { metrics, tab, object } = useContext(ResourceMetricsContext) ?? {};

  if (!metrics || !object || !tab) return null;
  if (isMetricsEmpty(metrics)) return <NoMetrics/>;

  const id = object.getId();
  const values = Object.values(metrics)
    .map(normalizeMetrics)
    .map(({ data }) => data.result[0].values);
  const [
    bytesSentSuccess,
    bytesSentFailure,
    requestDurationSeconds,
    responseDurationSeconds,
  ] = values;

  const datasets: Partial<Record<MetricsTab, ChartDataSets[]>> = {
    Network: [
      {
        id: `${id}-bytesSentSuccess`,
        label: `Bytes sent, status 2xx`,
        tooltip: `Bytes sent by Ingress controller with successful status`,
        borderColor: "#46cd9e",
        data: bytesSentSuccess.map(([x, y]) => ({ x, y })),
      },
      {
        id: `${id}-bytesSentFailure`,
        label: `Bytes sent, status 5xx`,
        tooltip: `Bytes sent by Ingress controller with error status`,
        borderColor: "#cd465a",
        data: bytesSentFailure.map(([x, y]) => ({ x, y })),
      },
    ],
    Duration: [
      {
        id: `${id}-requestDurationSeconds`,
        label: `Request`,
        tooltip: `Request duration in seconds`,
        borderColor: "#48b18d",
        data: requestDurationSeconds.map(([x, y]) => ({ x, y })),
      },
      {
        id: `${id}-responseDurationSeconds`,
        label: `Response`,
        tooltip: `Response duration in seconds`,
        borderColor: "#73ba3c",
        data: responseDurationSeconds.map(([x, y]) => ({ x, y })),
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
