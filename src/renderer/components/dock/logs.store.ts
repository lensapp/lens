import { autorun, computed, observable } from "mobx";

import { IPodLogsQuery, Pod, podsApi } from "../../api/endpoints";
import { autobind, interval } from "../../utils";
import { dockStore, TabId } from "./dock.store";
import { isLogsTab, logTabStore } from "./log-tab.store";
import {LogsStreamManager} from "./logs-stream-manager"
const logLinesToLoad = 500;

export interface LogRecord {
  podName: string
  timestamp: number
  record: string
}

@autobind()
export class LogsStore {
  logsStreamManager = new LogsStreamManager()

  @observable podLogs = observable.map<TabId, LogRecord[]>();

  /**
   * Function prepares tailLines param for passing to API request
   * Each time it increasing it's number, caused to fetch more logs.
   * Also, it handles loading errors, rewriting whole logs with error
   * messages
   * @param tabId
   */
  load = async (tabId: TabId) => {
    try {
      if (!this.podLogs.get(tabId)) {
        await this.loadLogs(tabId, {
          tailLines: this.lines + logLinesToLoad
        },
        (name: string,data: string) => this.podLogs.set(tabId, (this.podLogs.get(tabId) ?? []).concat({podName: name, timestamp: Date.parse(this.getTimestamps(data)?.[0]), record: this.removeTimestamps(data)})));
      }


      //this.refresher.start();
      //this.podLogs.set(tabId, logs);
    } catch ({error}) {
      const message = [
        { podName: name, timestamp: 1, record: `Failed to load logs: ${error.message}`},
        { podName: name, timestamp: 1, record:`Reason: ${error.reason} (${error.code})`}];

      //this.refresher.stop();
      this.podLogs.set(tabId, message);
    }
  };

  /**
   * Main logs loading function adds necessary data to payload and makes
   * an API request
   * @param tabId
   * @param params request parameters described in IPodLogsQuery interface
   * @returns {Promise} A fetch request promise
   */
  loadLogs = async (tabId: TabId, params: Partial<IPodLogsQuery>, callback : Function) => {
    const data = logTabStore.getData(tabId);

    let shutDownPods = new Set(this.logsStreamManager.logStreams.keys())
    for (let selectedPod of data.selectedPods){
      console.log("Load logs was called", selectedPod.getName())
      const pod = new Pod(selectedPod);
      const namespace = pod.getNs();
      const name = pod.getName();
      let status = this.logsStreamManager.logStreams.get(namespace + "/" + name)
      shutDownPods.delete(namespace + "/" + name)
      if (!status || status.done) {
        this.logsStreamManager.startLogStream(namespace, name, params, callback, ()=>{console.log(name + " pod logs was stoped")})
        console.log(name + " pod logs was started")
      }
    }
    shutDownPods.forEach((v) => {
      console.log(name + " pod logs should be stoped")
      let status = this.logsStreamManager.logStreams.get(v)
      status.done = true
      this.logsStreamManager.logStreams.set(v, status)
    })
    console.log("this.logsStreamManager.logStreams", this.logsStreamManager.logStreams)
  };


  /**
   * Converts logs into a string array
   * @returns {number} Length of log lines
   */
  @computed
  get lines() {
    const id = dockStore.selectedTabId;
    const logs = this.podLogs.get(id);

    return logs ? logs.length : 0;
  }


  /**
   * Returns logs with timestamps for selected tab
   */
  get logs(): string[] {
    const id = dockStore.selectedTabId;

    if (!this.podLogs.has(id)) return [];

    return this.podLogs.get(id).map(item => "[" + item.podName+ "]:" + item.record);
  }

  get logsWithoutTimestamps(): string[] {
    const id = dockStore.selectedTabId;

    if (!this.podLogs.has(id)) return [];

    return this.podLogs.get(id).map(item => "[" + item.podName+ "]:" + this.removeTimestamps(item.record));
  }

  /**
   * It gets timestamps from all logs then returns last one + 1 second
   * (this allows to avoid getting the last stamp in the selection)
   * @param tabId
   */
  getLastSinceTime(tabId: TabId) {
    const logs = this.podLogs.get(tabId);
    const timestamps = this.getTimestamps(logs[logs.length - 1].record);
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
    this.podLogs.delete(tabId);
  }
}

export const logsStore = new LogsStore();
