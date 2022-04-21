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
import { ThemeStore } from "../../theme.store";

interface Props extends ChartProps {
}

export interface PieChartData extends ChartJS.ChartData {
  datasets?: PieChartDataSets[];
}

export type DatasetTooltipLabel = (percent: string) => string | string;

interface PieChartDataSets extends ChartJS.ChartDataSets {
  id?: string;
  tooltipLabels?: DatasetTooltipLabel[];
}

@observer
export class PieChart extends React.Component<Props> {
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
          label: (tooltipItem, data: PieChartData) => {
            const dataset = data.datasets[tooltipItem.datasetIndex];
            const datasetData = dataset.data as number[];
            const total = datasetData.reduce((acc, cur) => acc + cur, 0);
            const percent = Math.round((datasetData[tooltipItem.index] as number / total) * 100);
            const percentLabel = isNaN(percent) ? "N/A" : `${percent}%`;
            const tooltipLabel = dataset.tooltipLabels?.[tooltipItem.index];
            let tooltip = `${dataset.label}: ${percentLabel}`;

            if (tooltipLabel) {
              if (typeof tooltipLabel === "function") {
                tooltip = tooltipLabel(percentLabel);
              } else {
                tooltip = tooltipLabel;
              }
            }

            return tooltip;
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
