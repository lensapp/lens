import "./overview-workload-status.scss";

import React from "react";
import capitalize from "lodash/capitalize";
import { findDOMNode } from "react-dom";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { PieChart } from "../chart";
import { cssVar } from "../../utils";
import { ChartData, ChartDataSets } from "chart.js";
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
        label: "Empty"
      }]
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
