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

import "./pie-chart.scss";
import React from "react";
import { observer } from "mobx-react";
import ChartJS, { ChartOptions } from "chart.js";
import { Chart, ChartProps } from "./chart";
import { cssNames } from "../../utils";
import { ThemeStore } from "../../theme.store";

interface Props extends ChartProps {
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
