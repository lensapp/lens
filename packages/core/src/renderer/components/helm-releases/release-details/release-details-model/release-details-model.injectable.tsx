/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue, IObservableValue } from "mobx";
import { runInAction, action, observable, computed } from "mobx";
import type { TargetHelmRelease } from "../target-helm-release.injectable";
import type { RequestDetailedHelmRelease, DetailedHelmRelease } from "./request-detailed-helm-release.injectable";
import requestDetailedHelmReleaseInjectable from "./request-detailed-helm-release.injectable";
import type { LensTheme } from "../../../../themes/lens-theme";
import type { RequestHelmReleaseConfiguration } from "../../../../../common/k8s-api/endpoints/helm-releases.api/request-configuration.injectable";
import requestHelmReleaseConfigurationInjectable from "../../../../../common/k8s-api/endpoints/helm-releases.api/request-configuration.injectable";
import { pipeline } from "@ogre-tools/fp";
import { groupBy, map } from "lodash/fp";
import type { KubeJsonApiData } from "@k8slens/kube-object";
import type { GetResourceDetailsUrl } from "./get-resource-details-url.injectable";
import getResourceDetailsUrlInjectable from "./get-resource-details-url.injectable";
import type { RequestHelmReleaseUpdate } from "../../../../../common/k8s-api/endpoints/helm-releases.api/request-update.injectable";
import updateReleaseInjectable from "../../update-release/update-release.injectable";
import type { ShowCheckedErrorNotification, ShowNotification } from "@k8slens/notifications";
import { showCheckedErrorNotificationInjectable, showSuccessNotificationInjectable } from "@k8slens/notifications";
import React from "react";
import createUpgradeChartTabInjectable from "../../../dock/upgrade-chart/create-upgrade-chart-tab.injectable";
import type { HelmRelease } from "../../../../../common/k8s-api/endpoints/helm-releases.api";
import type { NavigateToHelmReleases } from "../../../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import navigateToHelmReleasesInjectable from "../../../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import assert from "assert";
import activeThemeInjectable from "../../../../themes/active.injectable";
import hostedClusterIdInjectable from "../../../../cluster-frame-context/hosted-cluster-id.injectable";
import helmChartRepoInjectable from "../../helm-chart-repo.injectable";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { waitUntilDefined } from "@k8slens/utilities";

const releaseDetailsModelInjectable = getInjectable({
  id: "release-details-model",

  instantiate: async (di, targetRelease: TargetHelmRelease) => {
    const clusterId = di.inject(hostedClusterIdInjectable);

    assert(clusterId, "Cluster id is required");

    const model = new ReleaseDetailsModel({
      requestDetailedHelmRelease: di.inject(requestDetailedHelmReleaseInjectable),
      targetRelease,
      activeTheme: di.inject(activeThemeInjectable),
      clusterId,
      requestHelmReleaseConfiguration: di.inject(requestHelmReleaseConfigurationInjectable),
      getResourceDetailsUrl: di.inject(getResourceDetailsUrlInjectable),
      updateRelease: di.inject(updateReleaseInjectable),
      showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
      showSuccessNotification: di.inject(showSuccessNotificationInjectable),
      createUpgradeChartTab: di.inject(createUpgradeChartTabInjectable),
      navigateToHelmReleases: di.inject(navigateToHelmReleasesInjectable),
      helmChartRepo: di.injectFactory(helmChartRepoInjectable),
    });

    await model.load();

    return model;
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, release: TargetHelmRelease) => `${release.namespace}/${release.name}`,
  }),
});

export default releaseDetailsModelInjectable;

export interface OnlyUserSuppliedValuesAreShownToggle {
  readonly value: IObservableValue<boolean>;
  toggle: () => Promise<void>;
}

export interface ConfigurationInput {
  readonly nonSavedValue: IObservableValue<string>;
  readonly isLoading: IObservableValue<boolean>;
  readonly isSaving: IObservableValue<boolean>;
  onChange: (value: string) => void;
  save: () => Promise<void>;
}

interface Dependencies {
  readonly targetRelease: TargetHelmRelease;
  readonly activeTheme: IComputedValue<LensTheme>;
  readonly clusterId: string;
  requestDetailedHelmRelease: RequestDetailedHelmRelease;
  requestHelmReleaseConfiguration: RequestHelmReleaseConfiguration;
  getResourceDetailsUrl: GetResourceDetailsUrl;
  updateRelease: RequestHelmReleaseUpdate;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
  showSuccessNotification: ShowNotification;
  createUpgradeChartTab: (release: HelmRelease) => string;
  navigateToHelmReleases: NavigateToHelmReleases;
  helmChartRepo: (release: HelmRelease) => IAsyncComputed<string | undefined>;
}

export class ReleaseDetailsModel {
  readonly id = `${this.dependencies.targetRelease.namespace}/${this.dependencies.targetRelease.name}`;

  constructor(protected readonly dependencies: Dependencies) {}

  private readonly detailedRelease = observable.box<DetailedHelmRelease | undefined>();

  readonly loadingError = observable.box<string>();

  readonly configuration: ConfigurationInput = {
    nonSavedValue: observable.box(""),
    isLoading: observable.box(false),
    isSaving: observable.box(false),

    onChange: action((value: string) => {
      this.configuration.nonSavedValue.set(value);
    }),

    save: async () => {
      runInAction(() => {
        this.configuration.isSaving.set(true);
      });

      const name = this.release.getName();
      const namespace = this.release.getNs();
      const helmChartRepo = this.dependencies.helmChartRepo(this.release);
      const repo = await waitUntilDefined(helmChartRepo.value);

      const data = {
        chart: this.release.getChart(),
        repo,
        version: this.release.getVersion(),
        values: this.configuration.nonSavedValue.get(),
      };

      const result = await this.dependencies.updateRelease(name, namespace, data);

      runInAction(() => {
        this.configuration.isSaving.set(false);
      });

      if (!result.callWasSuccessful) {
        this.dependencies.showCheckedErrorNotification(
          result.error,
          "Unknown error occurred while updating release",
        );

        return;
      }

      this.dependencies.showSuccessNotification(
        <p>
          Release
          {" "}
          <b>{name}</b>
          {" successfully updated!"}
        </p>,
      );

      await this.loadConfiguration();
    },
  };

  readonly onlyUserSuppliedValuesAreShown: OnlyUserSuppliedValuesAreShownToggle = {
    value: observable.box(false),

    toggle: action(async () => {
      const value = this.onlyUserSuppliedValuesAreShown.value;

      value.set(!value.get());

      await this.loadConfiguration();
    }),
  };

  load = async () => {
    const { name, namespace } = this.dependencies.targetRelease;

    const result = await this.dependencies.requestDetailedHelmRelease({
      releaseName: name,
      namespace,
      clusterId: this.dependencies.clusterId,
    });

    if (!result.callWasSuccessful) {
      runInAction(() => {
        this.loadingError.set(result.error);
      });

      return;
    }

    runInAction(() => {
      this.detailedRelease.set(result.response);
    });

    await this.loadConfiguration();
  };

  private loadConfiguration = async () => {
    runInAction(() => {
      this.configuration.isLoading.set(true);
    });

    const { name, namespace } = this.release;

    const configuration =
      await this.dependencies.requestHelmReleaseConfiguration(
        name,
        namespace,
        !this.onlyUserSuppliedValuesAreShown.value.get(),
      );

    runInAction(() => {
      this.configuration.isLoading.set(false);
      this.configuration.nonSavedValue.set(configuration);
    });
  };

  @computed get release() {
    const detailedRelease = this.detailedRelease.get();

    assert(detailedRelease, "Tried to access release before load");

    return detailedRelease.release;
  }

  @computed private get details() {
    const detailedRelease = this.detailedRelease.get();

    assert(detailedRelease, "Tried to access details before load");

    return detailedRelease.details;
  }

  @computed get notes() {
    return this.details?.info.notes ?? "";
  }

  @computed get groupedResources(): MinimalResourceGroup[] {
    return pipeline(
      this.details.resources ?? [],
      groupBy((resource) => resource.kind),
      (grouped) => Object.entries(grouped),

      map(([kind, resources]) => ({
        kind,

        resources: resources.map(
          toMinimalResourceFor(this.dependencies.getResourceDetailsUrl, kind),
        ),

        isNamespaced: resources.some(
          (resource) => !!resource.metadata.namespace,
        ),
      })),
    );
  }

  @computed get activeTheme() {
    return this.dependencies.activeTheme.get().type;
  }

  close = () => {
    this.dependencies.navigateToHelmReleases();
  };

  startUpgradeProcess = () => {
    this.dependencies.createUpgradeChartTab(this.release);

    this.dependencies.navigateToHelmReleases();
  };
}

export interface MinimalResourceGroup {
  kind: string;
  isNamespaced: boolean;
  resources: MinimalResource[];
}

export interface MinimalResource {
  uid: string | undefined;
  name: string;
  namespace: string | undefined;
  detailsUrl: string | undefined;
}

const toMinimalResourceFor =
  (getResourceDetailsUrl: GetResourceDetailsUrl, kind: string) =>
    (resource: KubeJsonApiData): MinimalResource => {
      const { name, namespace, uid } = resource.metadata;

      return {
        uid,
        name,
        namespace,
        detailsUrl: getResourceDetailsUrl(
          kind,
          resource.apiVersion,
          namespace,
          name,
        ),
      };
    };
