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

import "./chart.scss";
import React from "react";
import ChartJS from "chart.js";
import { remove } from "lodash";
import { cssNames } from "../../utils";
import { StatusBrick } from "../status-brick";
import { Badge } from "../badge";

export interface ChartData extends ChartJS.ChartData {
  datasets?: ChartDataSets[];
}

export interface ChartDataSets extends ChartJS.ChartDataSets {
  id?: string;
  tooltip?: string;
}

export interface ChartProps {
  data: ChartData;
  options?: ChartJS.ChartOptions;  // Passed to ChartJS instance
  width?: number | string;
  height?: number | string;
  type?: ChartKind;
  showChart?: boolean;  // Possible to show legend only if false
  showLegend?: boolean;
  legendPosition?: "bottom";
  legendColors?: string[];  // Hex colors for each of the labels in data object
  plugins?: any[];
  redraw?: boolean;  // If true - recreate chart instance with no animation
  title?: string;
  className?: string;
}

export enum ChartKind {
  PIE = "pie",
  BAR = "bar",
  LINE = "line",
  DOUGHNUT = "doughnut",
}

const defaultProps: Partial<ChartProps> = {
  type: ChartKind.DOUGHNUT,
  options: {},
  showChart: true,
  showLegend: true,
  legendPosition: "bottom",
  plugins: [],
  redraw: false,
};

export class Chart extends React.Component<ChartProps> {
  static defaultProps = defaultProps as object;

  private canvas = React.createRef<HTMLCanvasElement>();
  private chart: ChartJS;
  // ChartJS adds _meta field to any data object passed to it.
  // We clone new data prop into currentChartData to compare props and prevProps
  private currentChartData: ChartData;

  componentDidMount() {
    const { showChart } = this.props;

    if (!showChart) return;
    this.renderChart();
  }

  componentDidUpdate() {
    const { showChart, redraw } = this.props;

    if (redraw) {
      this.chart.destroy();
      this.renderChart();

      return;
    }

    if (showChart) {
      if (!this.chart) this.renderChart();
      else this.updateChart();
    }
  }

  memoizeDataProps() {
    const { data } = this.props;

    this.currentChartData = {
      ...data,
      datasets: data.datasets && data.datasets.map(set => {
        return {
          ...set,
        };
      }),
    };
  }

  updateChart() {
    const { options } = this.props;

    if (!this.chart) return;

    this.chart.options = ChartJS.helpers.configMerge(this.chart.options, options);

    this.memoizeDataProps();

    const datasets: ChartDataSets[] = this.chart.config.data.datasets;
    const nextDatasets: ChartDataSets[] = this.currentChartData.datasets || [];

    // Remove stale datasets if they're not available in nextDatasets
    if (datasets.length > nextDatasets.length) {
      const sets = [...datasets];

      sets.forEach(set => {
        if (!nextDatasets.find(next => next.id === set.id)) {
          remove(datasets, (item => item.id === set.id));
        }
      });
    }

    // Mutating inner chart datasets to enable seamless transitions
    nextDatasets.forEach((next, datasetIndex) => {
      const index = datasets.findIndex(set => set.id === next.id);

      if (index !== -1) {
        datasets[index].data = datasets[index].data.slice();  // "Clean" mobx observables data to use in ChartJS
        datasets[index].data.splice(next.data.length);
        next.data.forEach((point: any, dataIndex: number) => {
          datasets[index].data[dataIndex] = next.data[dataIndex];
        });

        // Merge other fields
        const { data, ...props } = next;

        datasets[index] = {
          ...datasets[index],
          ...props,
        };
      } else {
        datasets[datasetIndex] = next;
      }
    });
    this.chart.update();
  }

  renderLegend() {
    if (!this.props.showLegend) return null;
    const { data, legendColors } = this.props;
    const { labels, datasets } = data;
    const labelElem = (title: string, color: string, tooltip?: string) => (
      <Badge
        key={title}
        className="LegendBadge flex gaps align-center"
        label={(
          <div className="flex items-center">
            <StatusBrick style={{ backgroundColor: color }} className="flex-shrink-0"/>
            <span>{title}</span>
          </div>
        )}
        tooltip={tooltip}
        expandable={false}
      />
    );

    return (
      <div className="legend flex wrap">
        {labels && labels.map((label: string, index) => {
          const { backgroundColor } = datasets[0] as any;
          const color = legendColors ? legendColors[index] : backgroundColor[index];

          return labelElem(label, color);
        })}
        {!labels && datasets.map(({ borderColor, label, tooltip }) =>
          labelElem(label, borderColor as any, tooltip),
        )}
      </div>
    );
  }

  renderChart() {
    const { type, options, plugins } = this.props;

    this.memoizeDataProps();
    this.chart = new ChartJS(this.canvas.current, {
      type,
      plugins,
      options: {
        ...options,
        legend: {
          display: false,
        },
      },
      data: this.currentChartData,
    });
  }

  render() {
    const { width, height, showChart, title, className } = this.props;

    return (
      <>
        <div className={cssNames("Chart", className)}>
          {title && <div className="chart-title">{title}</div>}
          {showChart &&
          <div className="chart-container">
            <canvas
              ref={this.canvas}
              width={width}
              height={height}
            />
            <div className="chartjs-tooltip flex column"></div>
          </div>
          }
          {this.renderLegend()}
        </div>
      </>
    );
  }
}
