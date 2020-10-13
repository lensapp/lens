import { autorun, computed, observable } from "mobx";
import { Pod, IPodContainer, podsApi, IPodLogsQuery } from "../../api/endpoints";
import { autobind, interval } from "../../utils";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, IDockTab, TabKind } from "./dock.store";
import { t } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Notifications } from "../notifications";

export interface IPodLogsData {
  pod: Pod;
  selectedContainer: IPodContainer
  containers: IPodContainer[]
  initContainers: IPodContainer[]
  showTimestamps: boolean
  previous: boolean
}

type TabId = string;
type PodLogs = string;

// Number for log lines to load
export const logRange = 100; // TODO: Change to 1000 for production

@autobind()
export class PodLogsStore extends DockTabStore<IPodLogsData> {
  private refresher = interval(10, () => {
    const id = dockStore.selectedTabId
    if (!this.logs.get(id)) return
    this.loadMore(id)
  });

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

  /**
   * Function prepares tailLines param for passing to API request
   * Each time it increasing it's number, caused to fetch more logs.
   * Also, it handles loading errors, rewriting whole logs with error
   * messages
   * @param tabId
   */
  load = async (tabId: TabId) => {
    const logs = await this.loadLogs(tabId, {
      tailLines: this.lines + logRange
    })
      .then(logs => {
        if (!this.refresher.isRunning) this.refresher.start();
        return logs;
      })
      .catch(({error}) => {
        const message = [
          _i18n._(t`Failed to load logs: ${error.message}`),
          _i18n._(t`Reason: ${error.reason} (${error.code})`)
        ].join("\n");
        this.refresher.stop();
        Notifications.error(message);
        return message;
      });
    this.logs.set(tabId, logs);
  }

  /**
   * Function is used to refreser/stream-like requests.
   * It changes 'sinceTime' param each time allowing to fetch logs
   * starting from last line recieved.
   * @param tabId
   */
  loadMore = async (tabId: TabId) => {
    const oldLogs = this.logs.get(tabId);
    const logs = await this.loadLogs(tabId, {
      sinceTime: this.getLastSinceTime(tabId)
    });
    // Add newly received logs to bottom
    // TODO: set a new log separator here
    this.logs.set(tabId, oldLogs + logs);
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
    return await podsApi.getLogs({ namespace, name }, {
      ...params,
      timestamps: true,  // Always setting timestampt to separate old logs from new ones
      container: selectedContainer.name,
      previous
    });
  }

  /**
   * Converts logs into a string array
   * @returns {number} Length of log lines
   */
  @computed
  get lines() {
    const id = dockStore.selectedTabId;
    const logs = this.logs.get(id);
    return logs ? logs.split("\n").length : 0;
  }

  /**
   * It gets timestamps from all logs then returns last one + 1 second
   * (this allows to avoid getting the last stamp in the selection)
   * @param tabId
   */
  getLastSinceTime(tabId: TabId) {
    const timestamps = this.getTimestamps(this.logs.get(tabId));
    let stamp = new Date(0);
    if (timestamps) {
      stamp = new Date(timestamps.slice(-1)[0]);
      stamp.setSeconds(stamp.getSeconds() + 1); // avoid duplicates from last second
    }
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
    title: `Logs: ${data.pod.getName()}`,
    ...tabParams
  }, false);
  podLogsStore.setData(tab.id, data);
  return tab;
}

export function isPodLogsTab(tab: IDockTab) {
  return tab && tab.kind === TabKind.POD_LOGS;
}
