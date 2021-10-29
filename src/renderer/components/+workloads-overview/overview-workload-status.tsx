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

import "./overview-workload-status.scss";

import React from "react";
import capitalize from "lodash/capitalize";
import { findDOMNode } from "react-dom";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { PieChart } from "../chart";
import { cssVar } from "../../utils";
import type { ChartData, ChartDataSets } from "chart.js";
import { ThemeStore } from "../../theme.store";

interface SimpleChartDataSets extends ChartDataSets {
  backgroundColor?: string[];
}

interface Props {
  status: {
    [key: string]: number;
  };
}

@observer
export class OverviewWorkloadStatus extends React.Component<Props> {
  @observable elem: HTMLElement;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    // eslint-disable-next-line react/no-find-dom-node
    this.elem = findDOMNode(this) as HTMLElement;
  }

  getStatusColor(status: string) {
    return cssVar(this.elem).get(`--workload-status-${status.toLowerCase()}`).toString();
  }

  renderChart() {
    if (!this.elem) return null;
    const { status } = this.props;
    const statuses = Object.entries(status);
    const chartData: Partial<ChartData> = {
      labels: [] as string[],
      datasets: [{
        data: [1],
        backgroundColor: [ThemeStore.getInstance().activeTheme.colors.pieChartDefaultColor],
        label: "Empty",
      }],
    };

    if (statuses.some(([, val]) => val > 0)) {
      const dataset: SimpleChartDataSets = {
        data: [],
        backgroundColor: [],
        label: "Status",
      };

      statuses.forEach(([key, val]) => {
        if (val !== 0) {
          dataset.data.push(val);
          dataset.backgroundColor.push(this.getStatusColor(key));
          chartData.labels.push(`${capitalize(key)}: ${val}`);
        }
      });
      chartData.datasets[0] = dataset;
    }
    const options = {
      elements: {
        arc: {
          borderWidth: 0,
        },
      },
    };

    return (
      <PieChart data={chartData} options={options}/>
    );
  }

  render() {
    return (
      <div className="OverviewWorkloadStatus">
        <div className="flex column align-center box grow">
          {this.renderChart()}
        </div>
      </div>
    );
  }
}
