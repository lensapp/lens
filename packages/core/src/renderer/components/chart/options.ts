/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ChartOptions, ChartPoint } from "chart.js";
import { bytesToUnits, isDefined } from "../../utils";

export type MetricsTab = "CPU" | "Memory" | "Disk" | "Pods" | "Network" | "Filesystem" | "Duration";

const memoryLikeOptions: ChartOptions = {
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
        stepSize: 1,
      },
    }],
  },
  tooltips: {
    callbacks: {
      label: ({ datasetIndex, index }, { datasets }) => {
        if (!isDefined(datasetIndex) || !isDefined(index) || !isDefined(datasets)) {
          return "";
        }

        const { label, data } = datasets[datasetIndex];

        if (!data) {
          return label ?? "";
        }

        const value = data[index] as { y: number };

        return `${label}: ${bytesToUnits(parseInt(value.y.toString()), { precision: 3 })}`;
      },
    },
  },
};

export const metricTabOptions: Record<MetricsTab, ChartOptions> = {
  Memory: memoryLikeOptions,
  Disk: memoryLikeOptions,
  Network: memoryLikeOptions,
  Filesystem: memoryLikeOptions,
  CPU: {
    scales: {
      yAxes: [{
        ticks: {
          callback: (value: number | string): string => {
            const float = parseFloat(`${value}`);

            if (float == 0) return "0";
            if (float < 10) return float.toFixed(3);
            if (float < 100) return float.toFixed(2);

            return float.toFixed(1);
          },
        },
      }],
    },
    tooltips: {
      callbacks: {
        label: ({ datasetIndex, index }, { datasets }) => {
          if (!isDefined(datasetIndex) || !isDefined(index) || !isDefined(datasets)) {
            return "";
          }

          const { label, data } = datasets[datasetIndex];

          if (!data) {
            return label ?? "";
          }

          const value = data[index] as ChartPoint;

          return `${label}: ${parseFloat(value.y as string).toPrecision(2)}`;
        },
      },
    },
  },
  Pods: {
    scales: {
      yAxes: [{
        ticks: {
          callback: value => value,
        },
      }],
    },
    tooltips: {
      callbacks: {
        label: ({ datasetIndex, index }, { datasets }) => {
          if (!isDefined(datasetIndex) || !isDefined(index) || !isDefined(datasets)) {
            return "";
          }

          const { label, data } = datasets[datasetIndex];

          if (!data) {
            return label ?? "";
          }

          const value = data[index] as ChartPoint;

          return `${label}: ${value.y}`;
        },
      },
    },
  },
  Duration: {
    scales: {
      yAxes: [{
        ticks: {
          callback: value => value,
        },
      }],
    },
    tooltips: {
      callbacks: {
        label: ({ datasetIndex, index }, { datasets }) => {
          if (!isDefined(datasetIndex) || !isDefined(index) || !isDefined(datasets)) {
            return "";
          }

          const { label, data } = datasets[datasetIndex];

          if (!data) {
            return label ?? "";
          }

          const value = data[index] as { y: string };

          return `${label}: ${parseFloat(value.y).toFixed(3)} sec`;
        },
      },
    },
  },
};
