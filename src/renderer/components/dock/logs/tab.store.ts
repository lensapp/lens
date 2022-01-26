/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import uniqueId from "lodash/uniqueId";
import { reaction } from "mobx";
import { podsStore } from "../../+workloads-pods/pods.store";

import { IPodContainer, Pod } from "../../../../common/k8s-api/endpoints";
import type { WorkloadKubeObject } from "../../../../common/k8s-api/workload-kube-object";
import logger from "../../../../common/logger";
import { DockTabStorageState, DockTabStore } from "../dock-tab-store/dock-tab.store";
import { DockStore, DockTabCreateSpecific, TabKind } from "../dock-store/dock.store";
import type { StorageHelper } from "../../../utils";

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

interface Dependencies {
  dockStore: DockStore
  createStorage: <T>(storageKey: string, options: DockTabStorageState<T>) => StorageHelper<DockTabStorageState<T>>
}

export class LogTabStore extends DockTabStore<LogTabData> {
  constructor(protected dependencies: Dependencies) {
    super(dependencies, {
      storageKey: "pod_logs",
    });

    reaction(() => podsStore.items.length, () => this.updateTabsData());
  }

  createPodTab({ selectedPod, selectedContainer }: PodLogsTabData): string {
    const podOwner = selectedPod.getOwnerRefs()[0];
    const pods = podsStore.getPodsByOwnerId(podOwner?.uid);
    const title = `Pod ${selectedPod.getName()}`;

    return this.createLogsTab(title, {
      pods: pods.length ? pods : [selectedPod],
      selectedPod,
      selectedContainer,
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
      selectedContainer,
    });
  }

  updateTabName(tabId: string) {
    const { selectedPod } = this.getData(tabId);

    this.dependencies.dockStore.renameTab(tabId, `Pod ${selectedPod.metadata.name}`);
  }

  private createDockTab(tabParams: DockTabCreateSpecific) {
    this.dependencies.dockStore.createTab({
      ...tabParams,
      kind: TabKind.POD_LOGS,
    }, false);
  }

  private createLogsTab(title: string, data: LogTabData): string {
    const id = uniqueId("log-tab-");

    this.createDockTab({ id, title });
    this.setData(id, {
      ...data,
      showTimestamps: false,
      previous: false,
    });

    return id;
  }

  private updateTabsData() {
    for (const [tabId, tabData] of this.data) {
      try {
        if (!tabData.selectedPod) {
          tabData.selectedPod = tabData.pods[0];
        }

        const pod = new Pod(tabData.selectedPod);
        const pods = podsStore.getPodsByOwnerId(pod.getOwnerRefs()[0]?.uid);
        const isSelectedPodInList = pods.find(item => item.getId() == pod.getId());
        const selectedPod = isSelectedPodInList ? pod : pods[0];
        const selectedContainer = isSelectedPodInList ? tabData.selectedContainer : pod.getAllContainers()[0];

        if (pods.length > 0) {
          this.setData(tabId, {
            ...tabData,
            selectedPod,
            selectedContainer,
            pods,
          });

          this.updateTabName(tabId);
        } else {
          this.closeTab(tabId);
        }
      } catch (error) {
        logger.error(`[LOG-TAB-STORE]: failed to set data for tabId=${tabId} deleting`, error);
        this.data.delete(tabId);
      }
    }
  }

  private closeTab(tabId: string) {
    this.clearData(tabId);
    this.dependencies.dockStore.closeTab(tabId);
  }
}

