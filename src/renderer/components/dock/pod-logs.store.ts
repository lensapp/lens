import { autorun, computed, observable, reaction } from "mobx";
import { Pod, IPodContainer, podsApi, IPodLogsQuery } from "../../api/endpoints";
import { autobind, interval } from "../../utils";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, IDockTab, TabKind } from "./dock.store";
import { t } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { searchStore } from "../../../common/search-store";

export interface IPodLogsData {
  pod: Pod;
  selectedContainer: IPodContainer
  containers: IPodContainer[]
  initContainers: IPodContainer[]
  showTimestamps: boolean
  previous: boolean
}

type TabId = string;
type PodLogLine = string;

// Number for log lines to load
export const logRange = 500;

@autobind()
export class PodLogsStore extends DockTabStore<IPodLogsData> {
  private refresher = interval(10, () => {
    const id = dockStore.selectedTabId
    if (!this.logs.get(id)) return
    this.loadMore(id)
  });

  @observable logs = observable.map<TabId, PodLogLine[]>();
  @observable newLogSince = observable.map<TabId, string>(); // Timestamp after which all logs are considered to be new

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

    reaction(() => this.logs.get(dockStore.selectedTabId), () => {
      this.setNewLogSince(dockStore.selectedTabId);
    })

    reaction(() => dockStore.selectedTabId, () => {
      // Clear search query on tab change
      searchStore.reset();
    })
  }

  /**
   * Function prepares tailLines param for passing to API request
   * Each time it increasing it's number, caused to fetch more logs.
   * Also, it handles loading errors, rewriting whole logs with error
   * messages
   * @param tabId
   */
  load = async (tabId: TabId) => {
    try {
      const logs = await this.loadLogs(tabId, {
        tailLines: this.lines + logRange
      });
      this.refresher.start();
      this.logs.set(tabId, logs);
    } catch ({error}) {
      const message = [
        _i18n._(t`Failed to load logs: ${error.message}`),
        _i18n._(t`Reason: ${error.reason} (${error.code})`)
      ];
      this.refresher.stop();
      this.logs.set(tabId, message);
    }
  }

  /**
   * Function is used to refreser/stream-like requests.
   * It changes 'sinceTime' param each time allowing to fetch logs
   * starting from last line recieved.
   * @param tabId
   */
  loadMore = async (tabId: TabId) => {
    if (!this.logs.get(tabId).length) return;
    const oldLogs = this.logs.get(tabId);
    const logs = await this.loadLogs(tabId, {
      sinceTime: this.getLastSinceTime(tabId)
    });
    // Add newly received logs to bottom
    this.logs.set(tabId, [...oldLogs, ...logs]);
  }

  /**
   * Main logs loading function adds necessary data to payload and makes
   * an API request
   * @param tabId
   * @param params request parameters described in IPodLogsQuery interface
   * @returns {Promise} A fetch request promise
   */
  loadLogs = async (tabId: TabId, params: Partial<IPodLogsQuery>) => {
    const data = this.getData(tabId);
    const { selectedContainer, previous } = data;
    const pod = new Pod(data.pod);
    const namespace = pod.getNs();
    const name = pod.getName();
    return podsApi.getLogs({ namespace, name }, {
      ...params,
      timestamps: true,  // Always setting timestampt to separate old logs from new ones
      container: selectedContainer.name,
      previous
    }).then(result => {
      const logs = [...result.split("\n")]; // Transform them into array
      logs.pop();  // Remove last empty element
      return logs;
    });
  }

  /**
   * Sets newLogSince separator timestamp to split old logs from new ones
   * @param tabId
   */
  setNewLogSince(tabId: TabId) {
    if (!this.logs.has(tabId) || !this.logs.get(tabId).length || this.newLogSince.has(tabId)) return;
    const timestamp = this.getLastSinceTime(tabId);
    this.newLogSince.set(tabId, timestamp.split(".")[0]); // Removing milliseconds from string
  }

  /**
   * Converts logs into a string array
   * @returns {number} Length of log lines
   */
  @computed
  get lines() {
    const id = dockStore.selectedTabId;
    const logs = this.logs.get(id);
    return logs ? logs.length : 0;
  }

  /**
   * It gets timestamps from all logs then returns last one + 1 second
   * (this allows to avoid getting the last stamp in the selection)
   * @param tabId
   */
  getLastSinceTime(tabId: TabId) {
    const logs = this.logs.get(tabId);
    const timestamps = this.getTimestamps(logs[logs.length - 1]);
    const stamp = new Date(timestamps ? timestamps[0] : null);
    stamp.setSeconds(stamp.getSeconds() + 1); // avoid duplicates from last second
    return stamp.toISOString();
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
    title: data.pod.getName(),
    ...tabParams
  }, false);
  podLogsStore.setData(tab.id, data);
  return tab;
}

export function isPodLogsTab(tab: IDockTab) {
  return tab && tab.kind === TabKind.POD_LOGS;
}
