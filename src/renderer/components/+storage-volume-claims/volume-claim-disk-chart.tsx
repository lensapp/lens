import React, { useContext } from "react";
import { observer } from "mobx-react";
import { t } from "@lingui/macro";
import { IPvcMetrics, PersistentVolumeClaim } from "../../api/endpoints";
import { BarChart, ChartDataSets, memoryOptions } from "../chart";
import { isMetricsEmpty, normalizeMetrics } from "../../api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { IResourceMetricsValue, ResourceMetricsContext } from "../resource-metrics";
import { _i18n } from "../../i18n";
import { themeStore } from "../../theme.store";

type IContext = IResourceMetricsValue<PersistentVolumeClaim, { metrics: IPvcMetrics }>;

export const VolumeClaimDiskChart = observer(() => {
  const { params: { metrics }, object } = useContext<IContext>(ResourceMetricsContext);
  const { chartCapacityColor } = themeStore.activeTheme.colors;
  const id = object.getId();

  if (!metrics) return null;
  if (isMetricsEmpty(metrics)) return <NoMetrics/>;

  const { diskUsage, diskCapacity } = metrics;
  const usage = normalizeMetrics(diskUsage).data.result[0].values;
  const capacity = normalizeMetrics(diskCapacity).data.result[0].values;

  const datasets: ChartDataSets[] = [
    {
      id: `${id}-diskUsage`,
      label: _i18n._(t`Usage`),
      tooltip: _i18n._(t`Volume disk usage`),
      borderColor: "#ffc63d",
      data: usage.map(([x, y]) => ({ x, y }))
    },
    {
      id: `${id}-diskCapacity`,
      label: _i18n._(t`Capacity`),
      tooltip: _i18n._(t`Volume disk capacity`),
      borderColor: chartCapacityColor,
      data: capacity.map(([x, y]) => ({ x, y }))
    }
  ];

  return (
    <BarChart
      className="VolumeClaimDiskChart flex box grow column"
      name={`pvc-${object.getName()}-disk`}
      timeLabelStep={10}
      options={memoryOptions}
      data={{ datasets }}
    />
  );
});
