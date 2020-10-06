import { Pod, IPodContainer } from "../../api/endpoints";
import { autobind } from "../../utils";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, IDockTab, TabKind } from "./dock.store";

export interface IPodLogsData {
  pod: Pod;
  container: IPodContainer;
}

@autobind()
export class PodLogsStore extends DockTabStore<IPodLogsData> {
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
  });
  podLogsStore.setData(tab.id, data);
  return tab;
}

export function isPodLogsTab(tab: IDockTab) {
  return tab && tab.kind === TabKind.POD_LOGS;
}
