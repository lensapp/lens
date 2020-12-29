import { action, autorun } from "mobx";
import { dockStore, IDockTab, TabId, TabKind } from "./dock.store";
import { DockTabStore } from "./dock-tab.store";
import { HelmChart, helmChartsApi } from "../../api/endpoints/helm-charts.api";
import { IReleaseUpdateDetails } from "../../api/endpoints/helm-releases.api";
import { Notifications } from "../notifications";

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

export class InstallChartStore extends DockTabStore<IChartInstallData> {
  public versions = new DockTabStore<string[]>();
  public details = new DockTabStore<IReleaseUpdateDetails>();

  constructor() {
    super({
      storageName: "install_charts"
    });
    autorun(() => {
      const { selectedTab, isOpen } = dockStore;

      if (isInstallChartTab(selectedTab) && isOpen) {
        this.loadData()
          .catch(err => Notifications.error(String(err)));
      }
    }, { delay: 250 });
  }

  @action
  async loadData(tabId = dockStore.selectedTabId) {
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
  async loadVersions(tabId: TabId) {
    const { repo, name, version } = this.getData(tabId);

    this.versions.clearData(tabId); // reset
    const charts = await helmChartsApi.get(repo, name, version);
    const versions = charts.versions.map(chartVersion => chartVersion.version);

    this.versions.setData(tabId, versions);
  }

  @action
  async loadValues(tabId: TabId, attempt = 0): Promise<void> {
    const data = this.getData(tabId);
    const { repo, name, version } = data;
    const values = await helmChartsApi.getValues(repo, name, version);

    if (values) {
      this.setData(tabId, { ...data, values });
    } else if (attempt < 4) {
      return this.loadValues(tabId, attempt + 1);
    }
  }
}

export const installChartStore = new InstallChartStore();

export function createInstallChartTab(chart: HelmChart, tabParams: Partial<IDockTab> = {}) {
  const { name, repo, version } = chart;
  const tab = dockStore.createTab({
    kind: TabKind.INSTALL_CHART,
    title: `Helm Install: ${repo}/${name}`,
    ...tabParams
  }, false);

  installChartStore.setData(tab.id, {
    name,
    repo,
    version,
    namespace: "default",
    releaseName: "",
    description: "",
  });

  return tab;
}

export function isInstallChartTab(tab: IDockTab) {
  return tab && tab.kind === TabKind.INSTALL_CHART;
}
