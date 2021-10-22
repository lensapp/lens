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

import { action, makeObservable, observable } from "mobx";
import { dockStore, DockTab, DockTabCreateSpecific, TabId, TabKind } from "./dock.store";
import { DockTabStore } from "./dock-tab.store";
import { getReleaseValues, HelmRelease, listReleases } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { helmChartStore, IChartVersion } from "../+apps-helm-charts/helm-chart.store";
import { releaseStore } from "../+apps-releases/release.store";

export interface IChartUpgradeData {
  releaseName: string;
  releaseNamespace: string;
}

export class UpgradeChartStore extends DockTabStore<IChartUpgradeData> {
  releases = observable.map<TabId, HelmRelease>();
  versions = observable.map<TabId, IChartVersion[]>();
  values = observable.map<TabId, string>();

  constructor() {
    super({ storageKey: "chart_releases" });
    makeObservable(this);
  }

  isReady(tabId: TabId) {
    return [
      this.releases.get(tabId),
      this.values.get(tabId),
      this.versions.get(tabId),
    ].every(Boolean);
  }

  async load(tabId: TabId) {
    await this.whenReady;
    await this.loadRelease(tabId);

    await Promise.all([
      this.loadVersions(tabId),
      this.loadValues(tabId),
    ]);
  }

  async updateRelease(tabId: TabId, { version, repo }: IChartVersion) {
    const release = this.releases.get(tabId);
    const values = this.values.get(tabId);
    const chart = release.getChart();
    const releaseName = release.getName();
    const namespace = release.getNs();

    await releaseStore.update(releaseName, namespace, { chart, values, version, repo });
    await this.loadRelease(tabId, true); // refresh local instance
  }

  async loadRelease(tabId: TabId, force = false) {
    if (this.releases.has(tabId) && !force) {
      return;
    }

    const { releaseName, releaseNamespace } = this.getData(tabId);
    let release = releaseStore.getByName(releaseName, releaseNamespace);

    if (!release) {
      const releasesInNamespace = await listReleases(releaseNamespace);

      release = releasesInNamespace.find(item => item.getName() == releaseName && item.getNs() === releaseNamespace);
    }

    if (!release) {
      throw new Error(`Helm release "${releaseName}" doesn't exist in namespace "${releaseNamespace}"`);
    }

    this.releases.set(tabId, release);
  }

  @action
  async loadValues(tabId: TabId, force = false) {
    if (this.values.has(tabId) && !force) {
      return;
    }

    const { releaseName, releaseNamespace } = this.getData(tabId);
    const values = await getReleaseValues(releaseName, releaseNamespace, true);

    this.values.set(tabId, values);
  }

  @action
  async loadVersions(tabId: TabId, force = false) {
    if (this.versions.has(tabId) && !force) {
      return;
    }

    const release = this.releases.get(tabId);
    const versions = await helmChartStore.getVersions(release.getChart());

    this.versions.set(tabId, versions);
  }

  getTabId(releaseName: string, namespace: string): TabId {
    return Object.entries(this.data)
      .find(([/*tabId*/, data]) => data.releaseName === releaseName && data.releaseNamespace === namespace)?.[0];
  }

  getTabByRelease(releaseName: string, namespace: string): DockTab {
    const tabId = this.getTabId(releaseName, namespace);

    return dockStore.getTabById(tabId);
  }

  clearData(tabId: TabId) {
    super.clearData(tabId);
    this.releases.delete(tabId);
    this.versions.delete(tabId);
    this.values.delete(tabId);
  }

  reset() {
    super.reset();
    this.releases.clear();
    this.versions.clear();
    this.values.clear();
  }
}

export const upgradeChartStore = new UpgradeChartStore();

export function createUpgradeChartTab(release: HelmRelease, tabParams: DockTabCreateSpecific = {}) {
  let tab = upgradeChartStore.getTabByRelease(release.getName(), release.getNs());

  if (tab) {
    dockStore.open();
    dockStore.selectTab(tab.id);
  }

  if (!tab) {
    tab = dockStore.createTab({
      title: `Helm Upgrade: ${release.getName()}`,
      ...tabParams,
      kind: TabKind.UPGRADE_CHART,
    }, false);

    upgradeChartStore.setData(tab.id, {
      releaseName: release.getName(),
      releaseNamespace: release.getNs()
    });
  }

  return tab;
}
