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
import { getReleaseValues, HelmRelease } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { releaseStore } from "../+apps-releases/release.store";
import type { IChartVersion } from "../+apps-helm-charts/helm-chart.store";
import { helmChartStore } from "../+apps-helm-charts/helm-chart.store";

export interface IChartUpgradeData {
  releaseName: string;
  releaseNamespace: string;
}

export class UpgradeChartStore extends DockTabStore<IChartUpgradeData> {
  public values = observable.map<TabId, string>();
  public versions = observable.array<IChartVersion>();

  constructor() {
    super({ storageKey: "chart_releases" });
    makeObservable(this);
  }

  protected async init() {
    super.init();
    await releaseStore.loadFromContextNamespaces();

    this.dispose.push(
      dockStore.onTabChange(({ tabId }) => this.loadData(tabId), {
        tabKind: TabKind.UPGRADE_CHART,
        fireImmediately: true,
      }),
    );
  }

  hasValues(tabId: TabId) {
    return this.values.has(tabId);
  }

  async loadData(tabId: TabId) {
    await Promise.all([
      this.loadValues(tabId),
      this.loadVersions(tabId),
    ]);
  }

  getRelease(tabId: TabId) {
    const releaseName = this.getData(tabId)?.releaseName;

    if (!releaseName) return null;

    return releaseStore.getByName(releaseName);
  }

  @action
  async loadVersions(tabId: TabId) {
    try {
      const { releaseName } = this.getData(tabId);

      this.versions.clear();
      const versions = await helmChartStore.getVersions(releaseName);

      this.versions.replace(versions);
    } catch (error) {
      console.error(`[UPGRADE-CHART]: loading versions has failed: ${error}`);
    }
  }

  @action
  async loadValues(tabId: TabId, { forceReload = false } = {}) {
    if (this.hasValues(tabId) && !forceReload) {
      return;
    }

    try {
      this.values.delete(tabId);
      const { releaseName, releaseNamespace } = this.getData(tabId);
      const values = await getReleaseValues(releaseName, releaseNamespace, true);

      this.values.set(tabId, values);
    } catch (error) {
      console.error(`[UPGRADE-CHART]: loading values has failed: ${error}`);
    }
  }

  getTabByRelease(releaseName: string): DockTab | null {
    const entry = Object.entries(this.data).find(([, data]) => data.releaseName === releaseName);

    return entry ? dockStore.getTabById(entry[0]) : null;
  }
}

export const upgradeChartStore = new UpgradeChartStore();

export function createUpgradeChartTab(release: HelmRelease, tabParams: DockTabCreateSpecific = {}) {
  let tab = upgradeChartStore.getTabByRelease(release.getName());

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
