import uniqueId from "lodash/uniqueId";
import { podsStore } from "../+workloads-pods/pods.store";

import { IPodContainer, Pod } from "../../api/endpoints";
import { WorkloadKubeObject } from "../../api/workload-kube-object";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, IDockTab, TabId, TabKind } from "./dock.store";

export interface LogTabData {
  pods: Pod[];
  selectedPod: Pod;
  selectedContainer: IPodContainer
  containers?: IPodContainer[]
  initContainers?: IPodContainer[]
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
  }

  public createPodTab({ selectedPod, selectedContainer }: PodLogsTabData) {
    const podOwner = selectedPod.getOwnerRefs()[0];
    const pods = podsStore.getPodsByOwnerId(podOwner?.uid);
    const title = `Pod ${selectedPod.getName()}`;

    this.createLogsTab(title, {
      pods: pods.length ? pods : [selectedPod],
      selectedPod,
      selectedContainer
    });
  }

  public createWorkloadTab({ workload }: WorkloadLogsTabData) {
    const pods = podsStore.getPodsByOwnerId(workload.getId());

    if (!pods.length) return;

    const selectedPod = pods[0];
    const selectedContainer = selectedPod.getAllContainers()[0];
    const title = `${workload.kind} ${selectedPod.getName()}`;

    this.createLogsTab(title, {
      pods: pods.length ? pods : [selectedPod],
      selectedPod,
      selectedContainer
    });
  }

  private createDockTab(tabParams: Partial<IDockTab>) {
    dockStore.createTab({
      kind: TabKind.POD_LOGS,
      ...tabParams
    }, false);
  }

  private saveControlsData(id: TabId, data: LogTabData) {
    this.setData(id, data);
  }

  private addBasicControlsData(data: LogTabData): LogTabData {
    const containers = data.selectedPod.getContainers();
    const initContainers = data.selectedPod.getInitContainers();

    return {
      ...data,
      containers,
      initContainers,
      showTimestamps: false,
      previous: false
    };
  }

  private createLogsTab(title: string, data: LogTabData) {
    const id = uniqueId("log-tab-");
    const fullData = this.addBasicControlsData(data);

    this.createDockTab({ id, title });
    this.saveControlsData(id, fullData);
  }
}

export const logTabStore = new LogTabStore();

export function isLogsTab(tab: IDockTab) {
  return tab && tab.kind === TabKind.POD_LOGS;
}