/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./overview-workload-status.scss";

import React from "react";
import capitalize from "lodash/capitalize";
import { observer } from "mobx-react";
import type { DatasetTooltipLabel, PieChartData } from "../chart";
import { PieChart } from "../chart";
import { cssVar, object } from "../../utils";
import type { ThemeStore } from "../../themes/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import themeStoreInjectable from "../../themes/store.injectable";

export interface OverviewWorkloadStatusProps {
  status: Partial<Record<string, number>>;
}

interface Dependencies {
  themeStore: ThemeStore;
}

@observer
class NonInjectedOverviewWorkloadStatus extends React.Component<OverviewWorkloadStatusProps & Dependencies> {
  private elem: HTMLElement | null = null;

  renderChart() {
    if (!this.elem) {
      return null;
    }

    const cssVars = cssVar(this.elem);
    const chartData: Required<PieChartData> = {
      labels: [],
      datasets: [],
    };

    const statuses = object.entries(this.props.status).filter(([, val]) => val > 0);

    if (statuses.length === 0) {
      chartData.datasets.push({
        data: [1],
        backgroundColor: [this.props.themeStore.activeTheme.colors.pieChartDefaultColor],
        label: "Empty",
      });
    } else {
      const data: number[] = [];
      const backgroundColor: string[] = [];
      const tooltipLabels: DatasetTooltipLabel[] = [];

      for (const [status, value] of statuses) {
        data.push(value);
        backgroundColor.push(cssVars.get(`--workload-status-${status.toLowerCase()}`).toString());
        tooltipLabels.push(percent => `${capitalize(status)}: ${percent}`);
        chartData.labels.push(`${capitalize(status)}: ${value}`);
      }

      chartData.datasets.push({
        data,
        backgroundColor,
        label: "Status",
        tooltipLabels,
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

export const OverviewWorkloadStatus = withInjectables<Dependencies, OverviewWorkloadStatusProps>(NonInjectedOverviewWorkloadStatus, {
  getProps: (di, props) => ({
    ...props,
    themeStore: di.inject(themeStoreInjectable),
  }),
});
