import React, { useContext } from "react";
import { t } from "@lingui/macro";
import { observer } from "mobx-react";
import { ChartOptions, ChartPoint } from "chart.js";
import { IIngressMetrics, Ingress } from "../../api/endpoints";
import { BarChart, memoryOptions } from "../chart";
import { normalizeMetrics, isMetricsEmpty } from "../../api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { ResourceMetricsContext, IResourceMetricsValue } from "../resource-metrics";
import { _i18n } from "../../i18n";

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
    responseDurationSeconds
  ] = values;

  const datasets = [
    // Network
    [
      {
        id: `${id}-bytesSentSuccess`,
        label: _i18n._(t`Bytes sent, status 2xx`),
        tooltip: _i18n._(t`Bytes sent by Ingress controller with successful status`),
        borderColor: "#46cd9e",
        data: bytesSentSuccess.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-bytesSentFailure`,
        label: _i18n._(t`Bytes sent, status 5xx`),
        tooltip: _i18n._(t`Bytes sent by Ingress controller with error status`),
        borderColor: "#cd465a",
        data: bytesSentFailure.map(([x, y]) => ({ x, y }))
      },
    ],
    // Duration
    [
      {
        id: `${id}-requestDurationSeconds`,
        label: _i18n._(t`Request`),
        tooltip: _i18n._(t`Request duration in seconds`),
        borderColor: "#48b18d",
        data: requestDurationSeconds.map(([x, y]) => ({ x, y }))
      },
      {
        id: `${id}-responseDurationSeconds`,
        label: _i18n._(t`Response`),
        tooltip: _i18n._(t`Response duration in seconds`),
        borderColor: "#73ba3c",
        data: responseDurationSeconds.map(([x, y]) => ({ x, y }))
      },
    ]
  ];

  const durationOptions: ChartOptions = {
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
          const chartTooltipSec = _i18n._(t`sec`);

          return `${label}: ${parseFloat(value.y as string).toFixed(3)} ${chartTooltipSec}`;
        }
      }
    }
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