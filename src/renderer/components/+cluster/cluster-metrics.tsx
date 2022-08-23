/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./cluster-metrics.module.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";
import type { ChartOptions, ChartPoint } from "chart.js";
import type { ClusterOverviewStore } from "./cluster-overview-store/cluster-overview-store";
import { MetricType } from "./cluster-overview-store/cluster-overview-store";
import { BarChart } from "../chart";
import { bytesToUnits, cssNames } from "../../utils";
import { Spinner } from "../spinner";
import { ZebraStripesPlugin } from "../chart/zebra-stripes.plugin";
import { ClusterNoMetrics } from "./cluster-no-metrics";
import { ClusterMetricSwitchers } from "./cluster-metric-switchers";
import { getMetricLastPoints } from "../../../common/k8s-api/endpoints/metrics.api";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterOverviewStoreInjectable from "./cluster-overview-store/cluster-overview-store.injectable";

interface Dependencies {
  clusterOverviewStore: ClusterOverviewStore;
}

const NonInjectedClusterMetrics = observer(({ clusterOverviewStore: { metricType, metricNodeRole, getMetricsValues, metricsLoaded, metrics }}: Dependencies) => {
  const [plugins] = useState([new ZebraStripesPlugin()]);
  const { memoryCapacity, cpuCapacity } = getMetricLastPoints(metrics);
  const metricValues = getMetricsValues(metrics);
  const colors = { cpu: "#3D90CE", memory: "#C93DCE" };
  const data = metricValues.map(value => ({
    x: value[0],
    y: parseFloat(value[1]).toFixed(3),
  }));

  const datasets = [{
    id: metricType + metricNodeRole,
    label: `${metricType.toUpperCase()} usage`,
    borderColor: colors[metricType],
    data,
  }];
  const cpuOptions: ChartOptions = {
    scales: {
      yAxes: [{
        ticks: {
          suggestedMax: cpuCapacity,
          callback: (value) => value,
        },
      }],
    },
    tooltips: {
      callbacks: {
        label: ({ index }, data) => {
          if (!index) {
            return "<unknown>";
          }

          const value = data.datasets?.[0].data?.[index] as ChartPoint;

          return value.y?.toString() ?? "<unknown>";
        },
      },
    },
  };
  const memoryOptions: ChartOptions = {
    scales: {
      yAxes: [{
        ticks: {
          suggestedMax: memoryCapacity,
          callback: (value: string) => !value ? 0 : bytesToUnits(parseInt(value)),
        },
      }],
    },
    tooltips: {
      callbacks: {
        label: ({ index }, data) => {
          if (!index) {
            return "<unknown>";
          }

          const value = data.datasets?.[0].data?.[index] as ChartPoint;

          return bytesToUnits(parseInt(value.y as string), { precision: 3 });
        },
      },
    },
  };
  const options = metricType === MetricType.CPU ? cpuOptions : memoryOptions;

  const renderMetrics = () => {
    if (!metricValues.length && !metricsLoaded) {
      return <Spinner center/>;
    }

    if (!memoryCapacity || !cpuCapacity) {
      return <ClusterNoMetrics className={styles.empty}/>;
    }

    return (
      <BarChart
        name={`${metricNodeRole}-${metricType}`}
        options={options}
        data={{ datasets }}
        timeLabelStep={5}
        showLegend={false}
        plugins={plugins}
        className={styles.chart}
      />
    );
  };

  return (
    <div className={cssNames(styles.ClusterMetrics, "flex column")}>
      <ClusterMetricSwitchers/>
      {renderMetrics()}
    </div>
  );
});

export const ClusterMetrics = withInjectables<Dependencies>(
  NonInjectedClusterMetrics,

  {
    getProps: (di) => ({
      clusterOverviewStore: di.inject(clusterOverviewStoreInjectable),
    }),
  },
);
