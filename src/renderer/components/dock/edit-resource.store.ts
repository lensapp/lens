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

import { makeObservable } from "mobx";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, DockTab, DockTabCreateSpecific, TabId, TabKind } from "./dock.store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { parseKubeApi } from "../../../common/k8s-api/kube-api-parse";
import type { KubeObject } from "../../../common/k8s-api/kube-object";

export interface EditingResource {
  resource: string; // resource path, e.g. "/api/v1/namespaces/default"
  draft?: string; // edited draft in yaml
}

export class EditResourceStore extends DockTabStore<EditingResource> {
  constructor() {
    super({ storageKey: "edit_resource_store" });
    makeObservable(this);
  }

  async getResource(tabId: TabId): Promise<KubeObject> {
    const resourcePath = this.getResourcePath(tabId);
    const { name, namespace } = parseKubeApi(resourcePath);

    return apiManager.getApi(resourcePath)?.get({ name, namespace });
  }

  getResourcePath(tabId: TabId): string {
    return this.getData(tabId)?.resource ?? "";
  }

  getTabByResource(object: KubeObject): DockTab {
    const [tabId] = Object.entries(this.data).find(([, { resource }]) => {
      return object.selfLink === resource;
    }) || [];

    return dockStore.getTabById(tabId);
  }
}

export const editResourceStore = new EditResourceStore();

export function editResourceTab(object: KubeObject, tabParams: DockTabCreateSpecific = {}) {
  // use existing tab if already opened
  let tab = editResourceStore.getTabByResource(object);

  if (tab) {
    dockStore.open();
    dockStore.selectTab(tab.id);
  }

  // or create new tab
  if (!tab) {
    tab = dockStore.createTab({
      title: `${object.kind}: ${object.getName()}`,
      ...tabParams,
      kind: TabKind.EDIT_RESOURCE,
    }, false);
    editResourceStore.setData(tab.id, {
      resource: object.selfLink,
    });
  }

  return tab;
}
