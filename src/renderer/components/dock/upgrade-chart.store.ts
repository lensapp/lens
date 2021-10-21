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

import { action, IReactionDisposer, IReactionOptions, makeObservable, observable, reaction } from "mobx";
import { dockStore, DockTab, DockTabCreateSpecific, TabId, TabKind } from "./dock.store";
import { DockTabStore } from "./dock-tab.store";
import { getReleaseValues, HelmRelease } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { releaseStore } from "../+apps-releases/release.store";
import { helmChartStore, IChartVersion } from "../+apps-helm-charts/helm-chart.store";

export interface IChartUpgradeData {
  releaseName: string;
  releaseNamespace: string;
}

// FIXME: detach `releaseStore` and load directly from api-calls

export class UpgradeChartStore extends DockTabStore<IChartUpgradeData> {
  private stopWatcher: IReactionDisposer;
  versions = observable.map<TabId, IChartVersion[]>();
  values = observable.map<TabId, string>();

  constructor() {
    super({ storageKey: "chart_releases" });
    makeObservable(this);
  }

  async init() {
    super.init();

    this.dispose.push(
      dockStore.onTabChange(async ({ tabId }) => {
        this.loadVersions(tabId);
        this.stopWatcher?.(); // unsubscribe previous active upgrade-chart tab
        this.stopWatcher = this.watchRelease(tabId);
      }, {
        tabKind: TabKind.UPGRADE_CHART,
        fireImmediately: true,
      }),
    );
  }

  private watchRelease(tabId: TabId, opts: IReactionOptions = {}): IReactionDisposer {
    const { releaseName, releaseNamespace } = this.getData(tabId);

    return reaction(
      () => releaseStore.getByName(releaseName, releaseNamespace)?.getRevision(),
      () => this.loadValues(tabId),
      {
        fireImmediately: true,
        ...opts,
      },
    );
  }

  // TODO
  upgrade(tabId: TabId, version: IChartVersion) {
    const release = this.getRelease(tabId);
    const chart = release.getChart();
    const values = this.values.get(tabId);

    console.warn("UPGRADE", { release, chart, values, version });
  }

  getRelease(tabId: TabId) {
    const { releaseName, releaseNamespace } = this.getData(tabId) ?? {};

    return releaseStore.getByName(releaseName, releaseNamespace);
  }

  isReady(tabId: TabId) {
    return [
      this.dataReady,
      this.values.get(tabId),
      this.versions.get(tabId),
    ].every(Boolean);
  }

  @action
  async loadValues(tabId: TabId) {
    const { releaseName, releaseNamespace } = this.getData(tabId);
    const values = await getReleaseValues(releaseName, releaseNamespace, true);

    this.values.set(tabId, values);
  }

  async loadVersions(tabId: TabId) {
    const { releaseName, releaseNamespace } = this.getData(tabId);
    const release = releaseStore.getByName(releaseName, releaseNamespace);

    if (!release) return;

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

  destroy() {
    super.destroy();
    this.stopWatcher?.();
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
