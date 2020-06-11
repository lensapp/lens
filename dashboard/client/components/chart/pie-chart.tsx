import "./pie-chart.scss";
import * as React from "react";
import * as ChartJS from "chart.js";
import { ChartData, ChartOptions } from "chart.js";
import { Chart, ChartProps } from "./chart";
import { cssNames } from "../../utils";
import { themeStore } from "../../theme.store";

interface Props extends ChartProps {
  title?: string;
}

export class PieChart extends React.Component<Props> {
  render() {
    const { data, className, options, ...settings } = this.props
    const { contentColor } = themeStore.activeTheme.colors;
    const cutouts = [88, 76, 63]
    const opts: ChartOptions = this.props.showChart === false ? {} : {
      maintainAspectRatio: false,
      tooltips: {
        mode: "index",
        callbacks: {
          title: () => "",
          label: (tooltipItem, data) => {
            const dataset: any = data["datasets"][tooltipItem.datasetIndex]
            const metaData = Object.values<{ total: number }>(dataset["_meta"])[0]
            const percent = Math.round((dataset["data"][tooltipItem["index"]] / metaData.total) * 100)
            if (isNaN(percent)) return "N/A";
            return percent + "%";
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
          borderColor: contentColor
        },
      },
      cutoutPercentage: cutouts[data.datasets.length - 1] || 50,
      responsive: true,
      ...options
    }
    return (
      <Chart
        className={cssNames("PieChart flex column align-center", className)}
        data={data}
        options={opts}
        {...settings}
      />
    )
  }
}

ChartJS.Tooltip.positioners.cursor = function (elements: any, position: { x: number; y: number }) {
  return position;
};