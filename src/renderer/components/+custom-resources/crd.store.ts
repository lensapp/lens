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

import { computed, reaction, makeObservable } from "mobx";
import { KubeObjectStore } from "../../kube-object.store";
import { autoBind } from "../../utils";
import { crdApi, CustomResourceDefinition } from "../../api/endpoints/crd.api";
import { apiManager } from "../../api/api-manager";
import { KubeApi } from "../../api/kube-api";
import { CRDResourceStore } from "./crd-resource.store";
import { KubeObject } from "../../api/kube-object";

function initStore(crd: CustomResourceDefinition) {
  const apiBase = crd.getResourceApiBase();
  const kind = crd.getResourceKind();
  const isNamespaced = crd.isNamespaced();
  const api = apiManager.getApi(apiBase) ?? new KubeApi({
    objectConstructor: KubeObject,
    apiBase,
    kind,
    isNamespaced,
  });

  if (!apiManager.getStore(api)) {
    apiManager.registerStore(new CRDResourceStore(api));
  }
}

export class CRDStore extends KubeObjectStore<CustomResourceDefinition> {
  api = crdApi;

  constructor() {
    super();

    makeObservable(this);
    autoBind(this);

    // auto-init stores for crd-s
    reaction(() => this.getItems(), items => items.forEach(initStore));
  }

  protected sortItems(items: CustomResourceDefinition[]) {
    return super.sortItems(items, [
      crd => crd.getGroup(),
      crd => crd.getName(),
    ]);
  }

  @computed get groups() {
    const groups: Record<string, CustomResourceDefinition[]> = {};

    return this.items.reduce((groups, crd) => {
      const group = crd.getGroup();

      if (!groups[group]) groups[group] = [];
      groups[group].push(crd);

      return groups;
    }, groups);
  }

  getByGroup(group: string, pluralName: string) {
    const crdInGroup = this.groups[group];

    if (!crdInGroup) return null;

    return crdInGroup.find(crd => crd.getPluralName() === pluralName);
  }

  getByObject(obj: KubeObject) {
    if (!obj) return null;
    const { kind, apiVersion } = obj;

    return this.items.find(crd => (
      kind === crd.getResourceKind() && apiVersion === `${crd.getGroup()}/${crd.getVersion()}`
    ));
  }
}

export const crdStore = new CRDStore();

apiManager.registerStore(crdStore);
