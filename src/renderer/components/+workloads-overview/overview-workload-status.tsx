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
import { observer } from "mobx-react";
import { PieChart } from "../chart";
import { cssVar } from "../../utils";
import type { ChartData } from "chart.js";
import { ThemeStore } from "../../theme.store";

interface Props {
  status: Record<string, number>;
}

@observer
export class OverviewWorkloadStatus extends React.Component<Props> {
  elem?: HTMLElement;

  renderChart() {
    if (!this.elem) {
      return null;
    }

    const cssVars = cssVar(this.elem);
    const chartData: Required<ChartData> = {
      labels: [],
      datasets: [],
    };

    const statuses = Object.entries(this.props.status).filter(([, val]) => val > 0);

    if (statuses.length === 0) {
      chartData.datasets.push({
        data: [1],
        backgroundColor: [ThemeStore.getInstance().activeTheme.colors.pieChartDefaultColor],
        label: "Empty",
      });
    } else {
      const data: number[] = [];
      const backgroundColor: string[] = [];

      for (const [status, value] of statuses) {
        data.push(value);
        backgroundColor.push(cssVars.get(`--workload-status-${status.toLowerCase()}`).toString());
        chartData.labels.push(`${capitalize(status)}: ${value}`);
      }

      chartData.datasets.push({
        data,
        backgroundColor,
        label: "Status",
      });
    }

    return (
      <PieChart
        data={chartData}
        options={{
          elements: {
            arc: {
              borderWidth: 0,
            },
          },
        }}
      />
    );
  }

  render() {
    return (
      <div className="OverviewWorkloadStatus" ref={e => this.elem = e}>
        <div className="flex column align-center box grow">
          {this.renderChart()}
        </div>
      </div>
    );
  }
}
