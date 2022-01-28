/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useContext } from "react";
import { observer } from "mobx-react";
import type { ChartOptions, ChartPoint } from "chart.js";
import { BarChart, memoryOptions } from "../chart";
import { normalizeMetrics, isMetricsEmpty } from "../../../common/k8s-api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { ResourceMetricsContext } from "../resource-metrics";

export const IngressCharts = observer(() => {
  const { metrics, tabId, object } = useContext(ResourceMetricsContext);
  const id = object.getId();

  if (!metrics) return null;
  if (isMetricsEmpty(metrics)) return <NoMetrics/>;

  const values = Object.values(metrics)
    .map(normalizeMetrics)
    .map(({ data }) => data.result[0].values);
  const [
    bytesSentSuccess,
    bytesSentFailure,
    requestDurationSeconds,
    responseDurationSeconds,
  ] = values;

  const datasets = [
    // Network
    [
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
    // Duration
    [
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
  ];

  const durationOptions: ChartOptions = {
    scales: {
      yAxes: [{
        ticks: {
          callback: value => value,
        },
      }],
    },
    tooltips: {
      callbacks: {
        label: ({ datasetIndex, index }, { datasets }) => {
          const { label, data } = datasets[datasetIndex];
          const value = data[index] as ChartPoint;
          const chartTooltipSec = `sec`;

          return `${label}: ${parseFloat(value.y as string).toFixed(3)} ${chartTooltipSec}`;
        },
      },
    },
  };

  const options = [memoryOptions, durationOptions];

  return (
    <BarChart
      name={`${object.getName()}-metric-${tabId}`}
      options={options[tabId]}
      data={{ datasets: datasets[tabId] }}
    />
  );
});
