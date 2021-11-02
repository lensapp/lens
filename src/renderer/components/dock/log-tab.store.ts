/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import uniqueId from "lodash/uniqueId";
import { reaction } from "mobx";
import { podsStore } from "../+workloads-pods/pods.store";

import { IPodContainer, Pod } from "../../../common/k8s-api/endpoints";
import type { WorkloadKubeObject } from "../../../common/k8s-api/workload-kube-object";
import logger from "../../../common/logger";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, DockTabCreateSpecific, TabKind } from "./dock.store";

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

  renameTab(tabId: string) {
    const { selectedPod } = this.getData(tabId);

    dockStore.renameTab(tabId, `Pod ${selectedPod.metadata.name}`);
  }

  private createDockTab(tabParams: DockTabCreateSpecific) {
    dockStore.createTab({
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
  
          this.renameTab(tabId);
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
    dockStore.closeTab(tabId);
  }
}

export const logTabStore = new LogTabStore();
