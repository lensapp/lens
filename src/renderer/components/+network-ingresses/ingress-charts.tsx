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

import React, { useContext } from "react";
import { observer } from "mobx-react";
import type { ChartOptions, ChartPoint } from "chart.js";
import type { IIngressMetrics, Ingress } from "../../../common/k8s-api/endpoints";
import { BarChart, memoryOptions } from "../chart";
import { normalizeMetrics, isMetricsEmpty } from "../../../common/k8s-api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { ResourceMetricsContext, IResourceMetricsValue } from "../resource-metrics";

type IContext = IResourceMetricsValue<Ingress, { metrics: IIngressMetrics }>;

export const IngressCharts = observer(() => {
  const { params: { metrics }, tabId, object } = useContext<IContext>(ResourceMetricsContext);
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
