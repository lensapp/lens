/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action, computed } from "mobx";
import { normalizeMetrics } from "../../../../common/k8s-api/endpoints/metrics.api";
import clusterOverviewMetricsInjectable from "../cluster-metrics.injectable";
import type { MetricType } from "./storage.injectable";
import clusterOverviewStorageInjectable from "./storage.injectable";

export type SelectedMetricsType = ReturnType<typeof selectedMetricsTypeInjectable["instantiate"]>;

const selectedMetricsTypeInjectable = getInjectable({
  id: "selected-metrics-type",
  instantiate: (di) => {
    const storage = di.inject(clusterOverviewStorageInjectable);
    const overviewMetrics = di.inject(clusterOverviewMetricsInjectable);

    const value = computed(() => storage.get().metricType);
    const metrics = computed((): [number, string][] => {
      const rawValue = overviewMetrics.value.get();

      if (!rawValue) {
        return [];
      }

      const type = value.get();

      switch (type) {
        case "cpu":
          return normalizeMetrics(rawValue.cpuUsage).data.result[0].values;
        case "memory":
          return normalizeMetrics(rawValue.memoryUsage).data.result[0].values;
        default:
          return [];
      }
    });
    const hasCPUMetrics = computed(() => (
      normalizeMetrics(overviewMetrics.value.get()?.cpuUsage).data.result[0].values.length > 0
    ));
    const hasMemoryMetrics = computed(() => (
      normalizeMetrics(overviewMetrics.value.get()?.memoryUsage).data.result[0].values.length > 0
    ));

    return {
      value,
      metrics,
      hasCPUMetrics,
      hasMemoryMetrics,
      set: action((value: MetricType) => {
        storage.merge({ metricType: value });
      }),
    };
  },
});

export default selectedMetricsTypeInjectable;
