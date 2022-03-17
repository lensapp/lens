/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, makeObservable } from "mobx";
import type { TabId } from "../dock/store";
import type { DockTabStorageState } from "../dock-tab-store/dock-tab.store";
import { DockTabStore } from "../dock-tab-store/dock-tab.store";
import { getChartDetails, getChartValues } from "../../../../common/k8s-api/endpoints/helm-charts.api";
import type { HelmReleaseUpdateDetails } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import type { StorageHelper } from "../../../utils";
import { waitUntilDefinied } from "../../../../common/utils/wait";

export interface IChartInstallData {
  name: string;
  repo: string;
  version: string;
  values?: string;
  releaseName?: string;
  description?: string;
  namespace?: string;
  lastVersion?: boolean;
}

interface Dependencies {
  createStorage: <T>(storageKey: string, options: DockTabStorageState<T>) => StorageHelper<DockTabStorageState<T>>;
  versionsStore: DockTabStore<string[]>;
  detailsStore: DockTabStore<HelmReleaseUpdateDetails>;
}

export class InstallChartTabStore extends DockTabStore<IChartInstallData> {
  constructor(protected dependencies: Dependencies) {
    super(
      dependencies,
      { storageKey: "install_charts" },
    );
    makeObservable(this);
  }

  get versions() {
    return this.dependencies.versionsStore;
  }

  get details() {
    return this.dependencies.detailsStore;
  }

  @action
  async loadData(tabId: string) {
    const promises = [];
    const data = await waitUntilDefinied(() => this.getData(tabId));

    if (!this.getData(tabId)?.values) {
      promises.push(this.loadValues(tabId));
    }

    if (!this.versions.getData(tabId)) {
      promises.push(this.loadVersions(tabId, data));
    }

    await Promise.all(promises);
  }

  @action
  private async loadVersions(tabId: TabId, { repo, name, version }: IChartInstallData) {
    this.versions.clearData(tabId); // reset
    const charts = await getChartDetails(repo, name, { version });
    const versions = charts.versions.map(chartVersion => chartVersion.version);

    this.versions.setData(tabId, versions);
  }

  @action
  async loadValues(tabId: TabId, attempt = 0): Promise<void> {
    const data = await waitUntilDefinied(() => this.getData(tabId));
    const { repo, name, version } = data;
    const values = await getChartValues(repo, name, version);

    if (values) {
      this.setData(tabId, { ...data, values });
    } else if (attempt < 4) {
      return this.loadValues(tabId, attempt + 1);
    }
  }
}
