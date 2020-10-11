import { autorun, observable } from "mobx";
import { Pod, IPodContainer, podsApi } from "../../api/endpoints";
import { autobind, interval } from "../../utils";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, IDockTab, TabKind } from "./dock.store";
import { t } from "@lingui/macro";
import { _i18n } from "../../i18n";

export interface IPodLogsData {
  pod: Pod;
  selectedContainer: IPodContainer
  containers: IPodContainer[]
  initContainers: IPodContainer[]
  showTimestamps: boolean
  tailLines: number
}

type TabId = string;

interface PodLogs {
  oldLogs?: string
  newLogs?: string
}

@autobind()
export class PodLogsStore extends DockTabStore<IPodLogsData> {
  private refresher = interval(10, () => this.load(dockStore.selectedTabId));

  @observable logs = observable.map<TabId, PodLogs>();

  constructor() {
    super({
      storageName: "pod_logs"
    });
    autorun(() => {
      const { selectedTab, isOpen } = dockStore;
      if (isPodLogsTab(selectedTab) && isOpen) {
        this.refresher.start();
      } else {
        this.refresher.stop();
      }
    }, { delay: 500 });
  }

  load = async (tabId: TabId) => {
    if (!this.logs.has(tabId)) {
      this.logs.set(tabId, { oldLogs: "", newLogs: "" })
    }
    const data = this.getData(tabId);
    const { oldLogs, newLogs } = this.logs.get(tabId);
    const { selectedContainer, tailLines } = data;
    const pod = new Pod(data.pod);
    try {
      // if logs already loaded, check the latest timestamp for getting updates only from this point
      const logsTimestamps = this.getTimestamps(newLogs || oldLogs);
      let lastLogDate = new Date(0);
      if (logsTimestamps) {
        lastLogDate = new Date(logsTimestamps.slice(-1)[0]);
        lastLogDate.setSeconds(lastLogDate.getSeconds() + 1); // avoid duplicates from last second
      }
      const namespace = pod.getNs();
      const name = pod.getName();
      const loadedLogs = await podsApi.getLogs({ namespace, name }, {
        sinceTime: lastLogDate.toISOString(),
        timestamps: true,  // Always setting timestampt to separate old logs from new ones
        container: selectedContainer.name,
        tailLines: tailLines,
      });
      if (!oldLogs) {
        this.logs.set(tabId, { oldLogs: loadedLogs, newLogs });
      } else {
        this.logs.set(tabId, { oldLogs, newLogs: loadedLogs });
      }
    } catch (error) {
      this.logs.set(tabId, {
        oldLogs: [
          _i18n._(t`Failed to load logs: ${error.message}`),
          _i18n._(t`Reason: ${error.reason} (${error.code})`)
        ].join("\n"),
        newLogs
      });
    }
  }

  getTimestamps(logs: string) {
    return logs.match(/^\d+\S+/gm);
  }

  removeTimestamps(logs: string) {
    return logs.replace(/^\d+.*?\s/gm, "");
  }

  clearLogs(tabId: TabId) {
    this.logs.delete(tabId);
  }

  clearData(tabId: TabId) {
    this.data.delete(tabId);
    this.clearLogs(tabId);
  }
}

export const podLogsStore = new PodLogsStore();

export function createPodLogsTab(data: IPodLogsData, tabParams: Partial<IDockTab> = {}) {
  const podId = data.pod.getId();
  let tab = dockStore.getTabById(podId);
  if (tab) {
    dockStore.open();
    dockStore.selectTab(tab.id);
    return;
  }
  // If no existent tab found
  tab = dockStore.createTab({
    id: podId,
    kind: TabKind.POD_LOGS,
    title: `Logs: ${data.pod.getName()}`,
    ...tabParams
  }, false);
  podLogsStore.setData(tab.id, data);
  return tab;
}

export function isPodLogsTab(tab: IDockTab) {
  return tab && tab.kind === TabKind.POD_LOGS;
}
