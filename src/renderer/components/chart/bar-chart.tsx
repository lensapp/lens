import React from "react";
import merge from "lodash/merge";
import moment from "moment";
import Color from "color";
import { observer } from "mobx-react";
import { ChartColor, ChartData, ChartOptions, ChartTooltipCallback, Scriptable } from "chart.js";
import { Chart, ChartKind, ChartProps } from "./chart";
import { bytesToUnits, cssNames } from "../../utils";
import { ZebraStripes } from "./zebra-stripes.plugin";
import { themeStore } from "../../theme.store";
import { NoMetrics } from "../resource-metrics/no-metrics";

interface Props extends ChartProps {
  name?: string;
  timeLabelStep?: number;  // Minute labels appearance step
}

const defaultProps: Partial<Props> = {
  timeLabelStep: 10,
  plugins: [ZebraStripes]
};

type ScriptableCtx = Parameters<Scriptable<ChartColor>>[0];

function resolveColor(src: ChartColor | ChartColor[] | Scriptable<ChartColor>, ctx: ScriptableCtx): ChartColor {
  if (Array.isArray(src)) {
    return src[0];
  }

  if (typeof src === "function") {
    return src(ctx);
  }

  return src;
}

function getBarColor({ dataset }: ScriptableCtx): string {
  return Color(dataset.borderColor).alpha(0.2).string();
}

type ChartLabelCallback = ChartTooltipCallback["label"];

function resolveLabel(format: (src: string) => string): ChartLabelCallback {
  return function ({ datasetIndex, index }, { datasets }): string {
    const { label, data } = datasets[datasetIndex];
    const rawValue = data[index];
    const value = typeof rawValue === "number"
      ? rawValue
      : Array.isArray(rawValue)
        ? rawValue[0]
        : rawValue.y;

    return `${label}: ${format(value.toString())}`;
  };
}

@observer
export class BarChart extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  render() {
    const { name, data, className, timeLabelStep, plugins, options: customOptions, ...settings } = this.props;
    const { textColorPrimary, borderFaintColor, chartStripesColor } = themeStore.activeTheme.colors;

    // Remove empty sets and insert default data
    const chartData: ChartData = {
      ...data,
      datasets: data.datasets
        .filter(set => set.data.length)
        .map(item => ({
          type: ChartKind.BAR,
          borderWidth: { top: 3 },
          barPercentage: 1,
          categoryPercentage: 1,
          ...item
        }))
    };

    if (chartData.datasets.length == 0) {
      return <NoMetrics/>;
    }

    const formatTimeLabels = (timestamp: string, index: number) => {
      const label = moment(parseInt(timestamp)).format("HH:mm");
      const offset = "     ";

      if (index == 0) return offset + label;
      if (index == 60) return label + offset;

      return index % timeLabelStep == 0 ? label : "";
    };

    const barOptions: ChartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        xAxes: [{
          type: "time",
          offset: true,
          gridLines: {
            display: false,
          },
          stacked: true,
          ticks: {
            callback: formatTimeLabels,
            autoSkip: false,
            source: "data",
            backdropColor: "white",
            fontColor: textColorPrimary,
            fontSize: 11,
            maxRotation: 0,
            minRotation: 0
          },
          bounds: "data",
          time: {
            unit: "minute",
            displayFormats: {
              minute: "x"
            },
            parser: timestamp => moment.unix(parseInt(timestamp))
          }
        }],
        yAxes: [{
          position: "right",
          gridLines: {
            color: borderFaintColor,
            drawBorder: false,
            tickMarkLength: 0,
            zeroLineWidth: 0
          },
          ticks: {
            maxTicksLimit: 6,
            fontColor: textColorPrimary,
            fontSize: 11,
            padding: 8,
            min: 0
          }
        }]
      },
      tooltips: {
        mode: "index",
        position: "cursor",
        callbacks: {
          title: tooltipItems => {
            const now = new Date().getTime();

            if (new Date(tooltipItems[0].xLabel).getTime() > now) return "";

            return `${tooltipItems[0].xLabel}`;
          },
          labelColor: (tooltipItem) => ({
            borderColor: "darkgray",
            backgroundColor: resolveColor(chartData.datasets[tooltipItem.datasetIndex].borderColor, tooltipItem)
          })
        }
      },
      animation: {
        duration: 0
      },
      elements: {
        rectangle: {
          backgroundColor: getBarColor as any, // typings are incorrect
        }
      },
      plugins: {
        ZebraStripes: {
          stripeColor: chartStripesColor,
          interval: chartData.datasets[0].data.length
        }
      }
    };
    const options = merge(barOptions, customOptions);

    return (
      <Chart
        className={cssNames("BarChart flex box grow column", className)}
        type={ChartKind.BAR}
        data={chartData}
        options={options}
        plugins={plugins}
        {...settings}
      />
    );
  }
}

// Default options for all charts containing memory units (network, disk, memory, etc)
export const memoryOptions: ChartOptions = {
  scales: {
    yAxes: [{
      ticks: {
        callback: (value: number | string): string => {
          if (typeof value == "string") {
            const float = parseFloat(value);

            if (float < 1) {
              return float.toFixed(3);
            }

            return bytesToUnits(parseInt(value));
          }

          return bytesToUnits(value);
        },
        stepSize: 1
      }
    }]
  },
  tooltips: {
    callbacks: {
      label: resolveLabel(src => bytesToUnits(parseInt(src), 3)),
    }
  }
};

// Default options for all charts with cpu units or other decimal numbers
export const cpuOptions: ChartOptions = {
  scales: {
    yAxes: [{
      ticks: {
        callback: (value: number | string): string => {
          const float = parseFloat(value.toString());

          if (float == 0) return "0";

          const precision = 3 - Math.floor(Math.log10(float));
          const clampedPrecision = Math.max(Math.min(precision, 3), 1);

          return float.toFixed(clampedPrecision);
        }
      }
    }]
  },
  tooltips: {
    callbacks: {
      label: resolveLabel(src => parseFloat(src).toPrecision(2)),
    }
  }
};
