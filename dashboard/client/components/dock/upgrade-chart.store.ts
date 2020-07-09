import { action, autorun, IReactionDisposer, reaction } from "mobx";
import { t } from "@lingui/macro";
import { dockStore, DockTabData, TabId, TabKind } from "./dock.store";
import { DockTabStore } from "./dock-tab.store";
import { HelmRelease, helmReleasesApi } from "../../api/endpoints/helm-releases.api";
import { releaseStore } from "../+apps-releases/release.store";
import { _i18n } from "../../i18n";

export interface ChartUpgradeData {
  releaseName: string;
  releaseNamespace: string;
}

export function isUpgradeChartTab(tab: DockTabData): boolean {
  return tab?.kind === TabKind.UPGRADE_CHART;
}

export class UpgradeChartStore extends DockTabStore<ChartUpgradeData> {
  private watchers = new Map<string, IReactionDisposer>();

  values = new DockTabStore<string>();

  constructor() {
    super({
      storageName: "chart_releases"
    });

    autorun(() => {
      const { selectedTab, isOpen } = dockStore;
      if (!isUpgradeChartTab(selectedTab)) {
        return;
      }
      if (isOpen) {
        this.loadData(selectedTab.id);
      }
    }, { delay: 250 });

    autorun(() => {
      const objects = [...this.data.values()];
      objects.forEach(({ releaseName }) => this.createReleaseWatcher(releaseName));
    });
  }

  private createReleaseWatcher(releaseName: string): void {
    if (this.watchers.get(releaseName)) {
      return;
    }
    const dispose = reaction(() => {
      const release = releaseStore.getByName(releaseName);
      if (release) {
        return release.revision;
      } // watch changes only by revision
    },
    release => {
      const releaseTab = this.getTabByRelease(releaseName);
      if (!releaseStore.isLoaded || !releaseTab) {
        return;
      }
      if (release) {
        // auto-reload values if was loaded before
        if (dockStore.selectedTab === releaseTab && this.values.getData(releaseTab.id)) {
          this.loadValues(releaseTab.id);
        }
      } else {
        // clean up watcher, close tab if release not exists / was removed
        dispose();
        this.watchers.delete(releaseName);
        dockStore.closeTab(releaseTab.id);
      }
    });
    this.watchers.set(releaseName, dispose);
  }

  isLoading(tabId = dockStore.selectedTabId): boolean {
    const values = this.values.getData(tabId);
    return !releaseStore.isLoaded || values === undefined;
  }

  @action
  async loadData(tabId: TabId): Promise<void> {
    const values = this.values.getData(tabId);
    await Promise.all([
      !releaseStore.isLoaded && releaseStore.loadAll(),
      !values && this.loadValues(tabId)
    ]);
  }

  @action
  async loadValues(tabId: TabId): Promise<void> {
    this.values.clearData(tabId); // reset
    const { releaseName, releaseNamespace } = this.getData(tabId);
    const values = await helmReleasesApi.getValues(releaseName, releaseNamespace);
    this.values.setData(tabId, values);
  }

  getTabByRelease(releaseName: string): DockTabData {
    const item = [...this.data].find(item => item[1].releaseName === releaseName);
    if (item) {
      const [tabId] = item;
      return dockStore.getTabById(tabId);
    }
  }
}

export const upgradeChartStore = new UpgradeChartStore();

export function createUpgradeChartTab(release: HelmRelease, tabParams: Partial<DockTabData> = {}): DockTabData {
  let tab = upgradeChartStore.getTabByRelease(release.getName());
  if (tab) {
    dockStore.open();
    dockStore.selectTab(tab.id);
  }
  if (!tab) {
    tab = dockStore.createTab({
      kind: TabKind.UPGRADE_CHART,
      title: _i18n._(t`Helm Upgrade: ${release.getName()}`),
      ...tabParams
    }, false);

    upgradeChartStore.setData(tab.id, {
      releaseName: release.getName(),
      releaseNamespace: release.namespace
    });
  }
  return tab;
}
