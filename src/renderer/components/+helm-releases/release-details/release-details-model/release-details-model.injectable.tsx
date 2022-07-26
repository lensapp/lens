/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IObservableValue } from "mobx";
import { runInAction, action, observable, computed } from "mobx";
import type { TargetHelmRelease } from "../target-helm-release.injectable";
import type { CallForHelmRelease, DetailedHelmRelease } from "./call-for-helm-release/call-for-helm-release.injectable";
import callForHelmReleaseInjectable from "./call-for-helm-release/call-for-helm-release.injectable";
import type { ThemeStore } from "../../../../themes/store";
import themeStoreInjectable from "../../../../themes/store.injectable";
import type { CallForHelmReleaseConfiguration } from "./call-for-helm-release-configuration/call-for-helm-release-configuration.injectable";
import callForHelmReleaseConfigurationInjectable from "./call-for-helm-release-configuration/call-for-helm-release-configuration.injectable";
import { toHelmRelease } from "../../releases.injectable";
import { pipeline } from "@ogre-tools/fp";
import { groupBy, map } from "lodash/fp";
import type { KubeJsonApiData } from "../../../../../common/k8s-api/kube-json-api";
import type { GetResourceDetailsUrl } from "./get-resource-details-url.injectable";
import getResourceDetailsUrlInjectable from "./get-resource-details-url.injectable";
import type { CallForHelmReleaseUpdate } from "../../update-release/call-for-helm-release-update/call-for-helm-release-update.injectable";
import updateReleaseInjectable from "../../update-release/update-release.injectable";
import type { ShowCheckedErrorNotification } from "../../../notifications/show-checked-error.injectable";
import showCheckedErrorNotificationInjectable from "../../../notifications/show-checked-error.injectable";
import type { ShowNotification } from "../../../notifications";
import showSuccessNotificationInjectable from "../../../notifications/show-success-notification.injectable";
import React from "react";
import createUpgradeChartTabInjectable from "../../../dock/upgrade-chart/create-upgrade-chart-tab.injectable";
import type { HelmRelease } from "../../../../../common/k8s-api/endpoints/helm-releases.api";
import type { NavigateToHelmReleases } from "../../../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import navigateToHelmReleasesInjectable from "../../../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import assert from "assert";
import withOrphanPromiseInjectable from "../../../../../common/utils/with-orphan-promise/with-orphan-promise.injectable";

const releaseDetailsModelInjectable = getInjectable({
  id: "release-details-model",

  instantiate: (di, targetRelease: TargetHelmRelease) => {
    const callForHelmRelease = di.inject(callForHelmReleaseInjectable);
    const callForHelmReleaseConfiguration = di.inject(callForHelmReleaseConfigurationInjectable);
    const themeStore = di.inject(themeStoreInjectable);
    const getResourceDetailsUrl = di.inject(getResourceDetailsUrlInjectable);
    const updateRelease = di.inject(updateReleaseInjectable);
    const showCheckedErrorNotification = di.inject(showCheckedErrorNotificationInjectable);
    const showSuccessNotification = di.inject(showSuccessNotificationInjectable);
    const createUpgradeChartTab = di.inject(createUpgradeChartTabInjectable);
    const navigateToHelmReleases = di.inject(navigateToHelmReleasesInjectable);
    const withOrphanPromise = di.inject(withOrphanPromiseInjectable);

    const model = new ReleaseDetailsModel({
      callForHelmRelease,
      targetRelease,
      themeStore,
      callForHelmReleaseConfiguration,
      getResourceDetailsUrl,
      updateRelease,
      showCheckedErrorNotification,
      showSuccessNotification,
      createUpgradeChartTab,
      navigateToHelmReleases,
    });

    const load = withOrphanPromise(model.load);

    // TODO: Reorganize Drawer to allow setting of header-bar in children to make "getPlaceholder" from injectable usable.
    load();

    return model;
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, release: TargetHelmRelease) =>
      `${release.namespace}/${release.name}`,
  }),
});

export default releaseDetailsModelInjectable;

export interface OnlyUserSuppliedValuesAreShownToggle {
  value: IObservableValue<boolean>;
  toggle: () => Promise<void>;
}

export interface ConfigurationInput {
  nonSavedValue: IObservableValue<string>;
  isLoading: IObservableValue<boolean>;
  isSaving: IObservableValue<boolean>;
  onChange: (value: string) => void;
  save: () => Promise<void>;
}

interface Dependencies {
  callForHelmRelease: CallForHelmRelease;
  targetRelease: TargetHelmRelease;
  themeStore: ThemeStore;
  callForHelmReleaseConfiguration: CallForHelmReleaseConfiguration;
  getResourceDetailsUrl: GetResourceDetailsUrl;
  updateRelease: CallForHelmReleaseUpdate;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
  showSuccessNotification: ShowNotification;
  createUpgradeChartTab: (release: HelmRelease) => string;
  navigateToHelmReleases: NavigateToHelmReleases;
}

export class ReleaseDetailsModel {
  id = `${this.dependencies.targetRelease.namespace}/${this.dependencies.targetRelease.name}`;

  constructor(private dependencies: Dependencies) {}

  private detailedRelease = observable.box<DetailedHelmRelease | undefined>();

  readonly isLoading = observable.box(false);

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

      const data = {
        chart: this.release.getChart(),
        repo: await this.release.getRepo(),
        version: this.release.getVersion(),
        values: this.configuration.nonSavedValue.get(),
      };

      const result = await this.dependencies.updateRelease(name, namespace, data);

      runInAction(() => {
        this.configuration.isSaving.set(false);
      });

      if (!result.updateWasSuccessful) {
        this.dependencies.showCheckedErrorNotification(
          result.error,
          "Unknown error occured while updating release",
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
    runInAction(() => {
      this.isLoading.set(true);
    });

    const { name, namespace } = this.dependencies.targetRelease;

    const detailedRelease = await this.dependencies.callForHelmRelease(
      name,
      namespace,
    );

    runInAction(() => {
      this.detailedRelease.set(detailedRelease);
    });

    await this.loadConfiguration();

    runInAction(() => {
      this.isLoading.set(false);
    });
  };

  private loadConfiguration = async () => {
    runInAction(() => {
      this.configuration.isLoading.set(true);
    });

    const { name, namespace } = this.release;

    const configuration =
      await this.dependencies.callForHelmReleaseConfiguration(
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

    return toHelmRelease(detailedRelease.release);
  }

  @computed private get details() {
    const detailedRelease = this.detailedRelease.get();

    assert(detailedRelease, "Tried to access details before load");

    return detailedRelease.details;
  }

  @computed get notes() {
    return this.details.info.notes;
  }

  @computed get groupedResources(): MinimalResourceGroup[] {
    return pipeline(
      this.details.resources,
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
    return this.dependencies.themeStore.activeTheme.type;
  }

  close = () => {
    this.dependencies.navigateToHelmReleases();
  };

  startUpgradeProcess = () => {
    this.dependencies.createUpgradeChartTab(this.release);

    this.close();
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
  creationTimestamp: string | undefined;
}

const toMinimalResourceFor =
  (getResourceDetailsUrl: GetResourceDetailsUrl, kind: string) =>
    (resource: KubeJsonApiData): MinimalResource => {
      const { creationTimestamp, name, namespace, uid } = resource.metadata;

      return {
        uid,
        name,
        namespace,
        creationTimestamp,

        detailsUrl: getResourceDetailsUrl(
          kind,
          resource.apiVersion,
          namespace,
          name,
        ),
      };
    };
