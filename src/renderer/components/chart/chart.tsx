/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./chart.scss";
import type { CSSProperties } from "react";
import React from "react";
import type { PluginServiceRegistrationOptions } from "chart.js";
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
  plugins?: PluginServiceRegistrationOptions[];
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
  private chart: ChartJS | null = null;
  // ChartJS adds _meta field to any data object passed to it.
  // We clone new data prop into currentChartData to compare props and prevProps
  private currentChartData?: ChartData;

  componentDidMount() {
    const { showChart } = this.props;

    if (showChart) {
      this.renderChart();
    }
  }

  componentDidUpdate() {
    const { showChart, redraw } = this.props;

    if (redraw) {
      this.chart?.destroy();
      this.renderChart();
    } else if (showChart) {
      if (!this.chart) {
        this.renderChart();
      } else {
        this.updateChart();
      }
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

    const datasets: ChartDataSets[] = (this.chart.config.data ??= {}).datasets ??= [];
    const nextDatasets: ChartDataSets[] = (this.currentChartData ??= {}).datasets ??= [];

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
        const data = datasets[index].data = (datasets[index].data ?? []).slice();  // "Clean" mobx observables data to use in ChartJS
        const nextData = next.data ??= [];

        data.splice(next.data.length);

        for (let dataIndex = 0; dataIndex < nextData.length; dataIndex += 1) {
          data[dataIndex] = nextData[dataIndex];
        }

        // Merge other fields
        const { data: _data, ...props } = next;

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
    const labelElem = (title: string | undefined, color: string | CSSProperties["backgroundColor"], tooltip?: string) => (
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
        {
          labels
            ? labels.map((label, index) => {
              const { backgroundColor = [] } = datasets?.[0] ?? {};
              const color = legendColors ? legendColors[index] : (backgroundColor as string[])[index];

              return labelElem(label as string, color);
            })
            : datasets?.map(({ borderColor, label, tooltip }) =>
              labelElem(label, borderColor as string, tooltip),
            )
        }
      </div>
    );
  }

  renderChart() {
    const { type, options, plugins } = this.props;
    const canvas = this.canvas.current;

    if (!canvas) {
      return;
    }

    this.memoizeDataProps();

    this.chart = new ChartJS(canvas, {
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
          {showChart && (
            <div className="chart-container">
              <canvas
                ref={this.canvas}
                width={width}
                height={height}
              />
              <div className="chartjs-tooltip flex column"></div>
            </div>
          )}
          {this.renderLegend()}
        </div>
      </>
    );
  }
}
