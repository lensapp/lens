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

import { barChartOptions } from "../chart";

/**
 * The CPU metrics tab
 */
enum CPUTab {
    CPU = "CPU"
}

/**
 * The Memory metrics tab
 */
enum MemoryTab {
    MEMORY = "Memory"
}

/**
 * The Filesystem metrics tab
 */
enum FilesystemTab {
    FILESYSTEM = "Filesystem"
}

/**
 * The Disk metrics tab
 */
enum DiskTab {
    DISK = "Disk"
}

/**
 * The Network metrics tab
 */
enum NetworkTab {
    NETWORK = "Network"
}

/**
 * The Duration metrics tab
 */
enum DurationTab {
    DURATION = "Duration"
}

/**
 * The Pods metrics tab
 */
enum PodsTab {
    PODS = "Pods"
}

export type PodMetricsTab = typeof PodMetricsTab;
export const PodMetricsTab = {
  ...CPUTab,
  ...MemoryTab,
  ...NetworkTab,
  ...FilesystemTab,
};
export const podMetricTabs = Object.values(PodMetricsTab);

export type ContainerMetricsTab = typeof ContainerMetricsTab;
export const ContainerMetricsTab = {
  ...CPUTab,
  ...MemoryTab,
  ...FilesystemTab,
};
export const containerMetricTabs = Object.values(ContainerMetricsTab);

export type NodeDetailsMetricsTab = typeof NodeDetailsMetricsTab;
export const NodeDetailsMetricsTab = {
  ...CPUTab,
  ...MemoryTab,
  ...DiskTab,
  ...PodsTab,
};
export const nodeDetailsMetricTabs = Object.values(NodeDetailsMetricsTab);

export type IngressMetricsTab = typeof IngressMetricsTab;
export const IngressMetricsTab = {
  ...NetworkTab,
  ...DurationTab,
};
export const ingressMetricTabs = Object.values(IngressMetricsTab);

/**
 * Get the bar chart options for a specific chart tab
 * @param tab The tab ID
 * @returns Bar chart options for that metrics tab
 */
export function getBarChartOptions(tab: string) {
  switch (tab) {
    case CPUTab.CPU:
      return barChartOptions.decimalUnits;
    default:
      return barChartOptions.memoryUnits;
  }
}
