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

import { action, makeObservable, observable, when } from "mobx";
import { dockStore, DockTab, DockTabCreateSpecific, TabId, TabKind } from "./dock.store";
import { DockTabsStore } from "./dock-tabs.store";
import { getReleaseValues, HelmRelease } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { releaseStore } from "../+apps-releases/release.store";

export interface IChartUpgradeData {
  releaseName: string;
  releaseNamespace: string;
}

export class UpgradeChartStore extends DockTabsStore<IChartUpgradeData> {
  public values = observable.map<TabId, string>();

  constructor() {
    super({
      storageKey: "chart_releases"
    });

    makeObservable(this);
  }

  get whenReady() {
    return Promise.all([
      super.whenReady,
      when(() => releaseStore.isLoaded),
    ]);
  }

  protected init() {
    super.init();

    this.dispose.push(
      dockStore.onTabChange(({ selectedTabId }) => {
        if (!this.isLoaded(selectedTabId)) {
          this.loadData(selectedTabId); // preload just once
        }
      }, {
        kind: TabKind.UPGRADE_CHART,
        isVisible: true,
        fireImmediately: true,
      }),
    );
  }

  isLoading(tabId = dockStore.selectedTabId) {
    const values = this.values.get(tabId);

    return !releaseStore.isLoaded || values === undefined;
  }

  isLoaded(tabId: TabId) {
    return this.values.has(tabId);
  }

  @action
  private async loadData(tabId: TabId) {
    const values = this.values.get(tabId);

    await Promise.all([
      !releaseStore.isLoaded && releaseStore.loadFromContextNamespaces(),
      !values && this.reloadValues(tabId)
    ]);
  }

  @action
  private async reloadValues(tabId: TabId) {
    this.values.delete(tabId);
    const { releaseName, releaseNamespace } = this.getData(tabId);
    const values = await getReleaseValues(releaseName, releaseNamespace, true);

    this.values.set(tabId, values);
  }

  getTabByRelease(releaseName: string): DockTab {
    const entry = Object
      .entries(this.data)
      .find(([, data]) => data.releaseName === releaseName);

    return dockStore.getTabById(entry?.[0]);
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
