import { Pod, IPodContainer } from "../../api/endpoints";
import { autobind } from "../../utils";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, IDockTab, TabKind } from "./dock.store";

export interface IPodLogsData {
  pod: Pod;
  container?: IPodContainer;
}

@autobind()
export class PodLogsStore extends DockTabStore<IPodLogsData> {
}

export const podLogsStore = new PodLogsStore();

export function createPodLogsTab(data: IPodLogsData, tabParams: Partial<IDockTab> = {}) {
  const tab = dockStore.createTab({
    kind: TabKind.POD_LOGS,
    title: "Logs",
    ...tabParams
  });
  podLogsStore.setData(tab.id, data);
  return tab;
}

export function isPodLogsTab(tab: IDockTab) {
  return tab && tab.kind === TabKind.POD_LOGS;
}
