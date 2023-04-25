/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { action, computed, observable, when } from "mobx";
import type { SingleValue } from "react-select";
import type { HelmChartVersion } from "../../helm-charts/helm-charts/versions";
import helmChartVersionsInjectable from "../../helm-charts/helm-charts/versions.injectable";
import releasesInjectable from "../../helm-releases/releases.injectable";
import updateReleaseInjectable from "../../helm-releases/update-release/update-release.injectable";
import type { HelmRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import requestHelmReleaseConfigurationInjectable from "../../../../common/k8s-api/endpoints/helm-releases.api/request-configuration.injectable";
import type { AsyncResult } from "@k8slens/utilities";
import { waitUntilDefined } from "@k8slens/utilities";
import type { SelectOption } from "../../select";
import type { DockTab } from "../dock/store";
import upgradeChartTabDataInjectable from "./tab-data.injectable";

export interface UpgradeChartModel {
  readonly release: HelmRelease;
  readonly versionOptions: IComputedValue<SelectOption<HelmChartVersion>[]>;
  readonly configuration: {
    readonly value: IComputedValue<string>;
    set: (value: string) => void;
    readonly error: IComputedValue<string | undefined>;
    setError: (error: unknown) => void;
  };
  readonly version: {
    readonly value: IComputedValue<HelmChartVersion | undefined>;
    set: (value: SingleValue<SelectOption<HelmChartVersion>>) => void;
  };
  submit: () => AsyncResult<void, string>;
}

const upgradeChartModelInjectable = getInjectable({
  id: "upgrade-chart-model",
  instantiate: async (di, tab): Promise<UpgradeChartModel> => {
    const releases = di.inject(releasesInjectable);
    const requestHelmReleaseConfiguration = di.inject(requestHelmReleaseConfigurationInjectable);
    const updateRelease = di.inject(updateReleaseInjectable);
    const tabData = await di.inject(upgradeChartTabDataInjectable, tab.id);

    const release = await waitUntilDefined(() => (
      releases.value
        .get()
        .find(release => (
          release.getName() === tabData.releaseName
          && release.getNs() === tabData.releaseNamespace
        ))
    ));

    const versions = di.inject(helmChartVersionsInjectable, release);

    const storedConfiguration = asyncComputed({
      getValueFromObservedPromise: () =>
        requestHelmReleaseConfiguration(
          release.getName(),
          release.getNs(),
          true,
        ),

      valueWhenPending: "",
    });

    await when(() => !versions.pending.get());

    const configrationValue = observable.box<string>();
    const configrationEditError = observable.box<string>();
    const configration: UpgradeChartModel["configuration"] = {
      value: computed(() => configrationValue.get() ?? storedConfiguration.value.get()),
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
      configuration: configration,
      version,
      submit: async () => {
        const selectedVersion = version.value.get();

        if (!selectedVersion) {
          return {
            callWasSuccessful: false,
            error: "No selected version",
          };
        }

        const editError = configrationEditError.get();

        if (editError) {
          return {
            callWasSuccessful: false,
            error: editError,
          };
        }

        const result = await updateRelease(
          release.getName(),
          release.getNs(),
          {
            chart: release.getChart(),
            values: configration.value.get(),
            ...selectedVersion,
          },
        );

        if (result.callWasSuccessful === true) {
          storedConfiguration.invalidate();

          return { callWasSuccessful: true };
        }

        return {
          callWasSuccessful: false,
          error: String(result.error),
        };
      },
    };
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, tab: DockTab) => tab.id,
  }),
});

export default upgradeChartModelInjectable;
