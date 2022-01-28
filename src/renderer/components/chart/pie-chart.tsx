/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pie-chart.scss";
import React from "react";
import { observer } from "mobx-react";
import ChartJS, { ChartOptions } from "chart.js";
import { Chart, ChartProps } from "./chart";
import { cssNames } from "../../utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import activeThemeInjectable from "../../themes/active-theme.injectable";
import type { Theme } from "../../themes/store";

export interface PieChartProps extends ChartProps {
}

interface Dependencies {
  activeTheme: IComputedValue<Theme>;
}

const NonInjectedPieChart = observer(({ activeTheme, data, className, options, showChart, ...chartProps }: Dependencies & PieChartProps) => {
  const { contentColor } = activeTheme.get().colors;
  const cutouts = [88, 76, 63];
  const opts: ChartOptions = showChart === false ? {} : {
    maintainAspectRatio: false,
    tooltips: {
      mode: "index",
      callbacks: {
        title: () => "",
        label: (tooltipItem, data) => {
          const dataset: any = data["datasets"][tooltipItem.datasetIndex];
          const metaData = Object.values<{ total: number }>(dataset["_meta"])[0];
          const percent = Math.round((dataset["data"][tooltipItem["index"]] / metaData.total) * 100);
          const label = dataset["label"];

          if (isNaN(percent)) return `${label}: N/A`;

          return `${label}: ${percent}%`;
        },
      },
      filter: ({ datasetIndex, index }, { datasets }) => {
        const { data } = datasets[datasetIndex];

        if (datasets.length === 1) return true;

        return index !== data.length - 1;
      },
      position: "cursor",
    },
    elements: {
      arc: {
        borderWidth: 1,
        borderColor: contentColor,
      },
    },
    cutoutPercentage: cutouts[data.datasets.length - 1] || 50,
    responsive: true,
    ...options,
  };

  return (
    <Chart
      className={cssNames("PieChart flex column align-center", className)}
      data={data}
      options={opts}
      {...chartProps}
    />
  );
});

export const PieChart = withInjectables<Dependencies, PieChartProps>(NonInjectedPieChart, {
  getProps: (di, props) => ({
    activeTheme: di.inject(activeThemeInjectable),
    ...props,
  }),
});

ChartJS.Tooltip.positioners.cursor = function (elements: any, position: { x: number; y: number }) {
  return position;
};
