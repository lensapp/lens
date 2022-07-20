/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed, observable } from "mobx";
import versionsOfSelectedHelmChartInjectable from "../versions-of-selected-helm-chart.injectable";
import type { HelmChart } from "../../../../../common/k8s-api/endpoints/helm-charts.api";
import type { SingleValue } from "react-select";

interface VersionSelectionOption {
  label: string;
  value: HelmChart;
}

export interface HelmChartDetailsVersionSelection {
  value: IComputedValue<HelmChart | undefined>;
  options: IComputedValue<VersionSelectionOption[]>;
  onChange: (option: SingleValue<VersionSelectionOption>) => void;
}

const helmChartDetailsVersionSelectionInjectable = getInjectable({
  id: "helm-chart-details-version-selection",

  instantiate: (di, chart: HelmChart): HelmChartDetailsVersionSelection => {
    const versionsOfSelectedHelmChart = di.inject(
      versionsOfSelectedHelmChartInjectable,
      chart,
    );

    const state = observable.box<HelmChart>();

    return {
      value: computed(
        () => state.get() || versionsOfSelectedHelmChart.value.get()[0],
      ),

      options: computed(() =>
        versionsOfSelectedHelmChart.value.get().map((chartVersion) => ({
          label: chartVersion.version,
          value: chartVersion,
        })),
      ),

      onChange: (option) => {
        if (option) {
          state.set(option.value);
        }
      },
    };
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, chart: HelmChart) => chart.getId(),
  }),
});

export default helmChartDetailsVersionSelectionInjectable;
