/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, makeObservable } from "mobx";
import type { TabId } from "../dock/store";
import { DockTabStorageLayer, DockTabStore, DockTabStoreDependencies } from "../dock-tab/store";
import { getChartDetails, getChartValues } from "../../../../common/k8s-api/endpoints/helm-chart.api";

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

export interface InstallChartManager extends DockTabStorageLayer<IChartInstallData> {
  loadValues: (tabId: TabId) => Promise<void>;
  initialLoad: (tabId: TabId) => Promise<void>;
}

export interface InstallChartTabStoreDependencies extends DockTabStoreDependencies<IChartInstallData> {
  versionsStore: DockTabStore<string[]>;
}

export class InstallChartTabStore extends DockTabStore<IChartInstallData> implements InstallChartManager {
  constructor(protected dependencies: InstallChartTabStoreDependencies) {
    super(dependencies);
    makeObservable(this);
  }

  get versions() {
    return this.dependencies.versionsStore;
  }

  @action
  async initialLoad(tabId: string) {
    const promises = [];

    if (!this.getData(tabId).values) {
      promises.push(this.loadValues(tabId));
    }

    if (!this.versions.getData(tabId)) {
      promises.push(this.loadVersions(tabId));
    }

    await Promise.all(promises);
  }

  @action
  private async loadVersions(tabId: TabId) {
    const { repo, name, version } = this.getData(tabId);

    this.versions.clearData(tabId); // reset
    const charts = await getChartDetails(repo, name, { version });
    const versions = charts.versions.map(chartVersion => chartVersion.version);

    this.versions.setData(tabId, versions);
  }

  @action
  async loadValues(tabId: TabId, attempt = 0): Promise<void> {
    const data = this.getData(tabId);
    const { repo, name, version } = data;
    const values = await getChartValues(repo, name, version);

    if (values) {
      this.setData(tabId, { ...data, values });
    } else if (attempt < 4) {
      return this.loadValues(tabId, attempt + 1);
    }
  }
}
