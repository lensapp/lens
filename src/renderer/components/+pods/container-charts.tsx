/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useContext } from "react";
import { observer } from "mobx-react";
import { BarChart, cpuOptions, memoryOptions } from "../chart";
import { isMetricsEmpty, normalizeMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { ResourceMetricsContext } from "../resource-metrics";
import { mapValues } from "lodash";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import activeThemeInjectable from "../../themes/active-theme.injectable";
import type { Theme } from "../../themes/store";

export interface ContainerChartsProps {}

interface Dependencies {
  activeTheme: IComputedValue<Theme>;
}

const NonInjectedContainerCharts = observer(({ activeTheme }: Dependencies & ContainerChartsProps) => {
  const { metrics, tabId } = useContext(ResourceMetricsContext);
  const { chartCapacityColor } = activeTheme.get().colors;

  if (!metrics) return null;
  if (isMetricsEmpty(metrics)) return <NoMetrics/>;

  const {
    cpuUsage,
    cpuRequests,
    cpuLimits,
    memoryUsage,
    memoryRequests,
    memoryLimits,
    fsUsage,
    fsWrites,
    fsReads,
  } = mapValues(metrics, metric => normalizeMetrics(metric).data.result[0].values);

  const datasets = [
    // CPU
    [
      {
        id: "cpuUsage",
        label: `Usage`,
        tooltip: `CPU cores usage`,
        borderColor: "#3D90CE",
        data: cpuUsage.map(([x, y]) => ({ x, y })),
      },
      {
        id: "cpuRequests",
        label: `Requests`,
        tooltip: `CPU requests`,
        borderColor: "#30b24d",
        data: cpuRequests.map(([x, y]) => ({ x, y })),
      },
      {
        id: "cpuLimits",
        label: `Limits`,
        tooltip: `CPU limits`,
        borderColor: chartCapacityColor,
        data: cpuLimits.map(([x, y]) => ({ x, y })),
      },
    ],
    // Memory
    [
      {
        id: "memoryUsage",
        label: `Usage`,
        tooltip: `Memory usage`,
        borderColor: "#c93dce",
        data: memoryUsage.map(([x, y]) => ({ x, y })),
      },
      {
        id: "memoryRequests",
        label: `Requests`,
        tooltip: `Memory requests`,
        borderColor: "#30b24d",
        data: memoryRequests.map(([x, y]) => ({ x, y })),
      },
      {
        id: "memoryLimits",
        label: `Limits`,
        tooltip: `Memory limits`,
        borderColor: chartCapacityColor,
        data: memoryLimits.map(([x, y]) => ({ x, y })),
      },
    ],
    // Filesystem
    [
      {
        id: "fsUsage",
        label: `Usage`,
        tooltip: `Bytes consumed on this filesystem`,
        borderColor: "#ffc63d",
        data: fsUsage.map(([x, y]) => ({ x, y })),
      },
      {
        id: "fsWrites",
        label: `Writes`,
        tooltip: `Bytes written on this filesystem`,
        borderColor: "#ff963d",
        data: fsWrites.map(([x, y]) => ({ x, y })),
      },
      {
        id: "fsReads",
        label: `Reads`,
        tooltip: `Bytes read on this filesystem`,
        borderColor: "#fff73d",
        data: fsReads.map(([x, y]) => ({ x, y })),
      },
    ],
  ];

  const options = tabId == 0 ? cpuOptions : memoryOptions;

  return (
    <BarChart
      name={`metrics-${tabId}`}
      options={options}
      data={{ datasets: datasets[tabId] }}
    />
  );
});

export const ContainerCharts = withInjectables<Dependencies, ContainerChartsProps>(NonInjectedContainerCharts, {
  getProps: (di, props) => ({
    activeTheme: di.inject(activeThemeInjectable),
    ...props,
  }),
});
