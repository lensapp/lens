/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import merge from "lodash/merge";
import moment from "moment";
import Color from "color";
import { observer } from "mobx-react";
import type { ChartOptions, ChartTooltipCallback, ChartTooltipItem, Scriptable } from "chart.js";
import type { ChartProps } from "./chart";
import { Chart, ChartKind } from "./chart";
import { bytesToUnits, cssNames, isObject } from "../../utils";
import { ZebraStripesPlugin } from "./zebra-stripes.plugin";
import type { ThemeStore } from "../../themes/store";
import { NoMetrics } from "../resource-metrics/no-metrics";
import assert from "assert";
import { withInjectables } from "@ogre-tools/injectable-react";
import themeStoreInjectable from "../../themes/store.injectable";

export interface BarChartProps extends ChartProps {
  name?: string;
  timeLabelStep?: number;  // Minute labels appearance step
}

const getBarColor: Scriptable<string> = ({ dataset }) => Color(dataset?.borderColor).alpha(0.2).string();

interface Dependencies {
  themeStore: ThemeStore;
}

const NonInjectedBarChart = observer(({
  themeStore,
  name,
  data,
  className,
  timeLabelStep = 10,
  plugins,
  options: customOptions,
  ...settings
}: Dependencies & BarChartProps) => {
  const { textColorPrimary, borderFaintColor, chartStripesColor } = themeStore.activeTheme.colors;
  const { datasets: rawDatasets = [], ...rest } = data;
  const datasets = rawDatasets
    .filter(set => set.data?.length)
    .map(item => ({
      type: ChartKind.BAR,
      borderWidth: { top: 3 },
      barPercentage: 1,
      categoryPercentage: 1,
      ...item,
    }));

  plugins ??= [new ZebraStripesPlugin({
    stripeColor: chartStripesColor,
    interval: datasets[0]?.data?.length,
  })];

  if (datasets.length === 0) {
    return <NoMetrics/>;
  }

  const formatTimeLabels = (timestamp: string, index: number) => {
    const label = moment(parseInt(timestamp)).format("HH:mm");
    const offset = "     ";

    if (index == 0) return offset + label;
    if (index == 60) return label + offset;

    return index % timeLabelStep == 0 ? label : "";
  };

  const barOptions: ChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      xAxes: [{
        type: "time",
        offset: true,
        gridLines: {
          display: false,
        },
        stacked: true,
        ticks: {
          callback: formatTimeLabels,
          autoSkip: false,
          source: "data",
          backdropColor: "white",
          fontColor: textColorPrimary,
          fontSize: 11,
          maxRotation: 0,
          minRotation: 0,
        },
        bounds: "data",
        time: {
          unit: "minute",
          displayFormats: {
            minute: "x",
          },
          parser: timestamp => moment.unix(parseInt(timestamp)),
        },
      }],
      yAxes: [{
        position: "right",
        gridLines: {
          color: borderFaintColor,
          drawBorder: false,
          tickMarkLength: 0,
          zeroLineWidth: 0,
        },
        ticks: {
          maxTicksLimit: 6,
          fontColor: textColorPrimary,
          fontSize: 11,
          padding: 8,
          min: 0,
        },
      }],
    },
    tooltips: {
      mode: "index",
      position: "cursor",
      callbacks: {
        title([tooltip]: ChartTooltipItem[]) {
          const xLabel = tooltip?.xLabel;
          const skipLabel = xLabel == null || new Date(xLabel).getTime() > Date.now();

          if (skipLabel) return "";

          return String(xLabel);
        },
        labelColor: ({ datasetIndex }) => (
          typeof datasetIndex === "number"
            ? {
              borderColor: "darkgray",
              backgroundColor: datasets[datasetIndex].borderColor as string,
            }
            : {
              borderColor: "darkgray",
              backgroundColor: "gray",
            }
        ),
      },
    },
    animation: {
      duration: 0,
    },
    elements: {
      rectangle: {
        backgroundColor: getBarColor.bind(null),
      },
    },
  };

  return (
    <Chart
      className={cssNames("BarChart flex box grow column", className)}
      type={ChartKind.BAR}
      data={{ datasets, ...rest }}
      options={merge(barOptions, customOptions)}
      plugins={plugins}
      {...settings}
    />
  );
});

export const BarChart = withInjectables<Dependencies, BarChartProps>(NonInjectedBarChart, {
  getProps: (di, props) => ({
    ...props,
    themeStore: di.inject(themeStoreInjectable),
  }),
});

const tooltipCallbackWith = (precision: number): ChartTooltipCallback["label"] => (
  ({ datasetIndex, index }, { datasets = [] }) => {
    if (typeof datasetIndex !== "number" || typeof index !== "number") {
      return "";
    }

    const { label, data } = datasets[datasetIndex];

    if (!label || !data) {
      return "<unknown>";
    }

    const value = data[index];

    assert(isObject(value) && !Array.isArray(value) && typeof value.y === "number");

    return `${label}: ${bytesToUnits(parseInt(value.y.toString()), { precision })}`;
  }
);

// Default options for all charts containing memory units (network, disk, memory, etc)
export const memoryOptions: ChartOptions = {
  scales: {
    yAxes: [{
      ticks: {
        callback: (value) => {
          if (typeof value == "string") {
            const float = parseFloat(value);

            if (float < 1) {
              return float.toFixed(3);
            }

            return bytesToUnits(parseInt(value));
          }

          return bytesToUnits(value);
        },
        stepSize: 1,
      },
    }],
  },
  tooltips: {
    callbacks: {
      label: tooltipCallbackWith(3),
    },
  },
};

// Default options for all charts with cpu units or other decimal numbers
export const cpuOptions: ChartOptions = {
  scales: {
    yAxes: [{
      ticks: {
        callback: (value) => {
          const float = parseFloat(`${value}`);

          if (float == 0) return "0";
          if (float < 10) return float.toFixed(3);
          if (float < 100) return float.toFixed(2);

          return float.toFixed(1);
        },
      },
    }],
  },
  tooltips: {
    callbacks: {
      label: tooltipCallbackWith(2),
    },
  },
};
