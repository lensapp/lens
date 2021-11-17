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

import Joi from "joi";
import uniqueId from "lodash/uniqueId";
import { action } from "mobx";
import type { IPodContainer, Pod } from "../../../common/k8s-api/endpoints";
import { DockTabStore, DockTabStoreOptions } from "./dock-tab.store";
import { dockStore, DockTab, DockTabCreate, TabId, TabKind } from "./dock.store";

export interface LogTabData {
  /**
   * The pod owner ID.
   */
  podsOwner?: string;

  /**
   * The ID of the pod from the list of pods owned by `.podsOwner`
   */
  selectedPod: string;

  /**
   * The namespace of the pods so that the pods can be retrieved.
   */
  namespace: string;

  /**
   * The name of the container within the selected pod.
   *
   * Note: container names are guaranteed unique
   */
  selectedContainer?: string;

  /**
   * Whether to show timestamps inline with the logs
   */
  showTimestamps: boolean;

  /**
   * Query for getting logs of the previous container restart
   */
  previous: boolean;
}

const logTabDataValidator = Joi.object({
  podsOwner: Joi
    .string()
    .optional(),
  selectedPod: Joi
    .string()
    .required(),
  namespace: Joi
    .string()
    .required(),
  selectedContainer: Joi
    .string()
    .optional(),
  showTimestamps: Joi
    .boolean()
    .required(),
  previous: Joi
    .boolean()
    .required(),
});

/**
 * Data for creating a pod logs tab based on a specific pod
 */
export interface PodLogsTabData {
  selectedPod: Pod
  selectedContainer: IPodContainer
}

export interface DockManager {
  renameTab(tabId: TabId, name: string): void;
  createTab(rawTabDesc: DockTabCreate, addNumber?: boolean): DockTab;
  closeTab(tabId: TabId): void;
}

export class LogTabStore extends DockTabStore<LogTabData> {
  constructor(params: Pick<DockTabStoreOptions<LogTabData>, "autoInit"> = {}, protected dockManager: DockManager = dockStore) {
    super({
      ...params,
      storageKey: "pod_logs",
      validator: value => {
        const { error } = logTabDataValidator.validate(value);

        if (error) {
          throw error;
        }
      },
    });
  }

  createPodTab(tabData: PodLogsTabData): string {
    if (!tabData || typeof tabData !== "object") {
      throw new TypeError("tabData is not an object");
    }

    const { selectedPod, selectedContainer } = tabData;

    if (!selectedPod || typeof selectedPod !== "object") {
      throw new TypeError("selectedPod is not an object");
    }

    if (!selectedContainer || typeof selectedContainer !== "object") {
      throw new TypeError("selectedContainer is not an object");
    }

    return this.createLogsTab(this.getTabName(selectedPod), {
      podsOwner: selectedPod.getOwnerRefs()[0]?.uid,
      namespace: selectedPod.getNs(),
      selectedPod: selectedPod.getId(),
      selectedContainer: selectedContainer.name,
      showTimestamps: false,
      previous: false,
    });
  }

  private getTabName(pod: Pod): string {
    return `Pod Logs: ${pod.getName()}`;
  }

  @action
  changeSelectedPod(tabId: string, pod: Pod): void {
    const oldSelectedPod = this.getData(tabId).selectedPod;

    if (pod.getId() === oldSelectedPod) {
      // Do nothing
      return;
    }

    this.mergeData(tabId, {
      selectedPod: pod.getId(),
      selectedContainer: pod.getContainers()[0]?.name,
    });
    this.dockManager.renameTab(tabId, this.getTabName(pod));
  }

  private createLogsTab(title: string, data: LogTabData): string {
    const id = uniqueId("log-tab-");

    this.dockManager.createTab({
      id,
      title,
      kind: TabKind.POD_LOGS,
    }, false);
    this.setData(id, data);

    return id;
  }

  @action
  public closeTab(tabId: string) {
    this.clearData(tabId);
    this.dockManager.closeTab(tabId);
  }

  /**
   * Get a set of namespaces which pod tabs care about
   */
  public getNamespaces(): string[] {
    const namespaces = new Set<string>();

    for (const { namespace } of this.data.values()) {
      namespaces.add(namespace);
    }

    return [...namespaces];
  }
}

export const logTabStore = new LogTabStore();
