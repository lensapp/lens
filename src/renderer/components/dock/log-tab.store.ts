import uniqueId from "lodash/uniqueId";
import { reaction } from "mobx";
import { podsStore } from "../+workloads-pods/pods.store";

import { IPodContainer, Pod } from "../../api/endpoints";
import { WorkloadKubeObject } from "../../api/workload-kube-object";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, IDockTab, TabKind } from "./dock.store";

export interface LogTabData {
  pods: Pod[];
  selectedPod: Pod;
  selectedContainer: IPodContainer
  showTimestamps?: boolean
  previous?: boolean
}

interface PodLogsTabData {
  selectedPod: Pod
  selectedContainer: IPodContainer
}

interface WorkloadLogsTabData {
  workload: WorkloadKubeObject
}

export class LogTabStore extends DockTabStore<LogTabData> {
  constructor() {
    super({
      storageName: "pod_logs"
    });

    reaction(() => podsStore.items.length, () => {
      this.updateTabsData();
    });
  }

  createPodTab({ selectedPod, selectedContainer }: PodLogsTabData): void {
    const podOwner = selectedPod.getOwnerRefs()[0];
    const pods = podsStore.getPodsByOwnerId(podOwner?.uid);
    const title = `Pod ${selectedPod.getName()}`;

    this.createLogsTab(title, {
      pods: pods.length ? pods : [selectedPod],
      selectedPod,
      selectedContainer
    });
  }

  createWorkloadTab({ workload }: WorkloadLogsTabData): void {
    const pods = podsStore.getPodsByOwnerId(workload.getId());

    if (!pods.length) return;

    const selectedPod = pods[0];
    const selectedContainer = selectedPod.getAllContainers()[0];
    const title = `${workload.kind} ${selectedPod.getName()}`;

    this.createLogsTab(title, {
      pods,
      selectedPod,
      selectedContainer
    });
  }

  renameTab(tabId: string) {
    const { selectedPod } = this.getData(tabId);

    dockStore.renameTab(tabId, `Pod ${selectedPod.metadata.name}`);
  }

  private createDockTab(tabParams: Partial<IDockTab>) {
    dockStore.createTab({
      kind: TabKind.POD_LOGS,
      ...tabParams
    }, false);
  }

  private createLogsTab(title: string, data: LogTabData) {
    const id = uniqueId("log-tab-");

    this.createDockTab({ id, title });
    this.setData(id, {
      ...data,
      showTimestamps: false,
      previous: false
    });
  }

  private updateTabsData() {
    this.data.forEach((tabData, tabId) => {
      const pod = new Pod(tabData.selectedPod);
      const pods = podsStore.getPodsByOwnerId(pod.getOwnerRefs()[0]?.uid);
      const isSelectedPodInList = pods.find(item => item.getId() == pod.getId());
      const selectedPod = isSelectedPodInList ? pod : pods[0];
      const selectedContainer = isSelectedPodInList ? tabData.selectedContainer : pod.getAllContainers()[0];

      if (pods.length) {
        this.setData(tabId, {
          ...tabData,
          selectedPod,
          selectedContainer,
          pods
        });

        this.renameTab(tabId);
      } else {
        this.closeTab(tabId);
      }
    });
  }

  private closeTab(tabId: string) {
    this.clearData(tabId);
    dockStore.closeTab(tabId);
  }
}

export const logTabStore = new LogTabStore();

export function isLogsTab(tab: IDockTab) {
  return tab && tab.kind === TabKind.POD_LOGS;
}
