/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pie-chart.scss";
import React from "react";
import { observer } from "mobx-react";
import type { ChartOptions } from "chart.js";
import ChartJS from "chart.js";
import type { ChartProps } from "./chart";
import { Chart } from "./chart";
import { cssNames } from "../../utils";
import { ThemeStore } from "../../theme.store";

export interface PieChartProps extends ChartProps {
}

@observer
export class PieChart extends React.Component<PieChartProps> {
  render() {
    const { data, className, options, ...chartProps } = this.props;
    const { contentColor } = ThemeStore.getInstance().activeTheme.colors;
    const cutouts = [88, 76, 63];
    const opts: ChartOptions = this.props.showChart === false ? {} : {
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
  }
}

ChartJS.Tooltip.positioners.cursor = function (elements: any, position: { x: number; y: number }) {
  return position;
};
