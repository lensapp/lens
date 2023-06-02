/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./cluster-metrics.module.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";
import type { ChartOptions, ChartPoint } from "chart.js";
import { BarChart } from "../chart";
import { bytesToUnits, cssNames } from "@k8slens/utilities";
import { Spinner } from "@k8slens/spinner";
import { ZebraStripesPlugin } from "../chart/zebra-stripes.plugin";
import { ClusterNoMetrics } from "./cluster-no-metrics";
import { ClusterMetricSwitchers } from "./cluster-metric-switchers";
import { getMetricLastPoints } from "../../../common/k8s-api/endpoints/metrics.api";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ClusterMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-cluster-metrics-by-node-names.injectable";
import type { SelectedMetricsType } from "./overview/selected-metrics-type.injectable";
import type { SelectedNodeRoleForMetrics } from "./overview/selected-node-role-for-metrics.injectable";
import clusterOverviewMetricsInjectable from "./cluster-metrics.injectable";
import selectedMetricsTypeInjectable from "./overview/selected-metrics-type.injectable";
import selectedNodeRoleForMetricsInjectable from "./overview/selected-node-role-for-metrics.injectable";

interface Dependencies {
  clusterOverviewMetrics: IAsyncComputed<ClusterMetricData | undefined>;
  selectedMetricsType: SelectedMetricsType;
  selectedNodeRoleForMetrics: SelectedNodeRoleForMetrics;
}

const NonInjectedClusterMetrics = observer((props: Dependencies) => {
  const {
    clusterOverviewMetrics,
    selectedMetricsType,
    selectedNodeRoleForMetrics,
  } = props;

  const metrics = clusterOverviewMetrics.value.get();
  const [plugins] = useState([new ZebraStripesPlugin()]);
  const { memoryCapacity, cpuCapacity } = getMetricLastPoints(metrics ?? {});
  const metricValues = selectedMetricsType.metrics.get();
  const metricType = selectedMetricsType.value.get();
  const metricNodeRole = selectedNodeRoleForMetrics.value.get();
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
  const options = metricType === "cpu" ? cpuOptions : memoryOptions;

  const renderMetrics = () => {
    if (!metricValues.length && !metrics) {
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

export const ClusterMetrics = withInjectables<Dependencies>(NonInjectedClusterMetrics, {
  getProps: (di) => ({
    clusterOverviewMetrics: di.inject(clusterOverviewMetricsInjectable),
    selectedMetricsType: di.inject(selectedMetricsTypeInjectable),
    selectedNodeRoleForMetrics: di.inject(selectedNodeRoleForMetricsInjectable),
  }),
});
