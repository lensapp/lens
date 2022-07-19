/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import installChartTabStoreInjectable from "./store.injectable";
import { waitUntilDefined } from "../../../../common/utils";
import type { CallForHelmChartValues } from "./chart-data/call-for-helm-chart-values.injectable";
import callForHelmChartValuesInjectable from "./chart-data/call-for-helm-chart-values.injectable";
import type { IChartInstallData, InstallChartTabStore } from "./store";
import type { HelmChart } from "../../../../common/k8s-api/endpoints/helm-charts.api";
import React from "react";
import {
  action,
  computed,
  observable,
  runInAction,
} from "mobx";
import assert from "assert";
import type { CallForCreateHelmRelease } from "../../+helm-releases/create-release/call-for-create-helm-release.injectable";
import callForCreateHelmReleaseInjectable from "../../+helm-releases/create-release/call-for-create-helm-release.injectable";
import type { HelmReleaseUpdateDetails } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import dockStoreInjectable from "../dock/store.injectable";
import type { NavigateToHelmReleases } from "../../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import navigateToHelmReleasesInjectable from "../../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import type { SingleValue } from "react-select";
import type { CallForHelmChartVersions } from "../../+helm-charts/details/versions/call-for-helm-chart-versions.injectable";
import callForHelmChartVersionsInjectable from "../../+helm-charts/details/versions/call-for-helm-chart-versions.injectable";

const installChartModelInjectable = getInjectable({
  id: "install-chart-model",

  instantiate: async (di, tabId: string) => {
    const store = di.inject(installChartTabStoreInjectable);
    const callForHelmChartValues = di.inject(callForHelmChartValuesInjectable);
    const callForHelmChartVersions = di.inject(callForHelmChartVersionsInjectable);
    const callForCreateHelmRelease = di.inject(callForCreateHelmReleaseInjectable);
    const dockStore = di.inject(dockStoreInjectable);
    const navigateToHelmReleases = di.inject(navigateToHelmReleasesInjectable);
    const closeTab = () => dockStore.closeTab(tabId);

    const waitForChart = async () => {
      await waitUntilDefined(() => store.getData(tabId));
    };

    const model = new InstallChartModel({
      tabId,
      waitForChart,
      callForCreateHelmRelease,
      closeTab,
      navigateToHelmReleases,
      callForHelmChartValues,
      callForHelmChartVersions,
      store,
    });

    await model.load();

    return model;
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, tabId: string) => tabId,
  }),
});

export default installChartModelInjectable;

interface Dependencies {
  tabId: string;
  closeTab: () => void;
  navigateToHelmReleases: NavigateToHelmReleases;
  waitForChart: () => Promise<void>;
  callForCreateHelmRelease: CallForCreateHelmRelease;
  callForHelmChartValues: CallForHelmChartValues;
  callForHelmChartVersions: CallForHelmChartVersions;
  store: InstallChartTabStore;
}

export class InstallChartModel {
  readonly namespace = {
    value: computed(() => this.chart?.namespace || "default"),

    onChange: action(
      (option: SingleValue<{ label: string; value: string }>) => {
        if (option) {
          const namespace = option.value;

          this.save({ namespace });
        }
      },
    ),
  };

  readonly customName = {
    value: computed(() => this.chart?.releaseName || ""),

    onChange: action((customName: string) => {
      this.save({ releaseName: customName });
    }),
  };

  private readonly versions = observable.array<HelmChart>([]);
  readonly installed = observable.box<HelmReleaseUpdateDetails | undefined>();

  private save = (data: Partial<IChartInstallData>) => {
    assert(this.chart);

    const chart = { ...this.chart, ...data };

    this.dependencies.store.setData(this.dependencies.tabId, chart);
  };

  readonly version = {
    value: computed(() => this.chart?.version),

    onChange: async (version: string | undefined) => {
      assert(this.chart);

      if (!version) {
        return;
      }

      this.save({ version });

      runInAction(() => {
        this.configuration.isLoading.set(true);
      });

      const configuration = await this.dependencies.callForHelmChartValues(
        this.chart.repo,
        this.chart.name,
        version,
      );

      runInAction(() => {
        this.configuration.onChange(configuration);
        this.configuration.isLoading.set(false);
      });
    },

    options: computed(() =>
      this.versions.map((chart) => ({
        label: chart.version,
        value: chart.version,
      })),
    ),
  };

  readonly configuration = {
    value: computed(() => this.chart?.values || ""),
    isLoading: observable.box(false),

    onChange: action((configuration: string) => {
      this.errorInConfiguration.value.set(undefined);

      this.save({ values: configuration });
    }),
  };

  readonly errorInConfiguration = {
    value: observable.box<string | undefined>(),

    onChange: action((error: unknown) => {
      this.errorInConfiguration.value.set(error as string);
    }),
  };

  readonly executionOutput = {
    isShown: observable.box(false),

    show: action(() => {
      this.executionOutput.isShown.set(true);
    }),

    close: action(() => {
      this.executionOutput.isShown.set(false);
    }),
  };

  constructor(private readonly dependencies: Dependencies) {}

  @computed
  private get chart() {
    const chart = this.dependencies.store.getData(this.dependencies.tabId);

    assert(chart);

    return chart;
  }

  load = async () => {
    await this.dependencies.waitForChart();

    const [defaultConfiguration, versions] = await Promise.all([
      this.dependencies.callForHelmChartValues(
        this.chart.repo,
        this.chart.name,
        this.chart.version,
      ),

      this.dependencies.callForHelmChartVersions(
        this.chart.repo,
        this.chart.name,
      ),
    ]);

    runInAction(() => {
      // TODO: Make "default" not hard-coded
      const namespace = this.chart.namespace || "default";

      this.versions.replace(versions);

      this.save({
        version: this.chart.version,
        namespace,
        values: this.chart.values || defaultConfiguration,
        releaseName: this.chart.releaseName,
      });
    });
  };

  @computed
  get isValid() {
    return !this.configuration.isLoading.get();
  }

  get chartName() {
    return `${this.repository}/${this.name}`;
  }

  private get name() {
    assert(this.chart);

    return this.chart.name;
  }

  private get repository() {
    assert(this.chart);

    return this.chart.repo;
  }

  install = async () => {
    const installed = await this.dependencies.callForCreateHelmRelease({
      name: this.customName.value.get() || undefined,
      chart: this.name,
      repo: this.repository,
      namespace: this.namespace.value.get() || "",
      version: this.version.value.get() || "",
      values: this.configuration.value.get() || "",
    });

    runInAction(() => {
      this.installed.set(installed);
    });

    return (
      <p>
        {"Chart Release "}
        <b>{installed.release.name}</b>
        {" successfully created."}
      </p>
    );
  };

  navigateToInstalledRelease = () => {
    const installed = this.installed.get();

    assert(installed);

    const release = installed.release;

    this.dependencies.navigateToHelmReleases({
      name: release.name,
      namespace: release.namespace,
    });

    this.dependencies.closeTab();
  };
}

