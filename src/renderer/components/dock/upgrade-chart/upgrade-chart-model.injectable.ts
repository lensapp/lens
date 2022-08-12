/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { action, computed, observable, when } from "mobx";
import type { SingleValue } from "react-select";
import type { HelmChartVersion } from "../../+helm-charts/helm-charts/versions";
import helmChartVersionsInjectable from "../../+helm-charts/helm-charts/versions.injectable";
import releasesInjectable from "../../+helm-releases/releases.injectable";
import updateReleaseInjectable from "../../+helm-releases/update-release/update-release.injectable";
import type { HelmRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import requestHelmReleaseConfigurationInjectable from "../../../../common/k8s-api/endpoints/helm-releases.api/request-configuration.injectable";
import { waitUntilDefined } from "../../../utils";
import type { SelectOption } from "../../select";
import type { DockTab } from "../dock/store";
import upgradeChartTabStoreInjectable from "./store.injectable";

export interface UpgradeChartModel {
  readonly release: HelmRelease;
  readonly versionOptions: IComputedValue<SelectOption<HelmChartVersion>[]>;
  readonly configration: {
    readonly value: IComputedValue<string>;
    set: (value: string) => void;
    readonly error: IComputedValue<string | undefined>;
    setError: (error: unknown) => void;
  };
  readonly version: {
    readonly value: IComputedValue<HelmChartVersion | undefined>;
    set: (value: SingleValue<SelectOption<HelmChartVersion>>) => void;
  };
  submit: () => Promise<UpgradeChartSubmitResult>;
}

export interface UpgradeChartSubmitResult {
  completedSuccessfully: boolean;
}

const upgradeChartModelInjectable = getInjectable({
  id: "upgrade-chart-model",
  instantiate: async (di, tab): Promise<UpgradeChartModel> => {
    const upgradeChartTabStore = di.inject(upgradeChartTabStoreInjectable);
    const releases = di.inject(releasesInjectable);
    const requestHelmReleaseConfiguration = di.inject(requestHelmReleaseConfigurationInjectable);
    const updateRelease = di.inject(updateReleaseInjectable);

    const tabData = await waitUntilDefined(() => upgradeChartTabStore.getData(tab.id));
    const release = await waitUntilDefined(() => releases.value.get().find(release => release.getName() === tabData.releaseName));
    const versions = di.inject(helmChartVersionsInjectable, release);
    const storedConfigration = asyncComputed(() => requestHelmReleaseConfiguration(
      release.getName(),
      release.getNs(),
      true,
    ), "");

    await when(() => !versions.pending.get());

    const configrationValue = observable.box<string>();
    const configrationEditError = observable.box<string>();
    const configration: UpgradeChartModel["configration"] = {
      value: computed(() => configrationValue.get() ?? storedConfigration.value.get()),
      set: action((value) => {
        configrationValue.set(value);
        configrationEditError.set(undefined);
      }),
      error: computed(() => configrationEditError.get()),
      setError: action((error) => configrationEditError.set(String(error))),
    };
    const versionValue = observable.box<HelmChartVersion>(undefined, {
      deep: false,
    });
    const version: UpgradeChartModel["version"] = {
      value: computed(() => versionValue.get() ?? versions.value.get()[0]),
      set: action((option) => versionValue.set(option?.value)),
    };
    const versionOptions = computed(() => (
      versions.value
        .get()
        .map(version => ({
          value: version,
          label: `${version.repo}/${release.getChart()}-${version.version}`,
        }))
    ));

    return {
      release,
      versionOptions,
      configration,
      version,
      submit: async () => {
        const selectedVersion = version.value.get();

        if (!selectedVersion || configrationEditError.get()) {
          return {
            completedSuccessfully: false,
          };
        }

        await updateRelease(
          release.getName(),
          release.getNs(),
          {
            chart: release.getChart(),
            values: configration.value.get(),
            ...selectedVersion,
          },
        );
        storedConfigration.invalidate();

        return {
          completedSuccessfully: true,
        };
      },
    };
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, tab: DockTab) => tab.id,
  }),
});

export default upgradeChartModelInjectable;
