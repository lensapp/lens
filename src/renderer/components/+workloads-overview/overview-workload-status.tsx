/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
