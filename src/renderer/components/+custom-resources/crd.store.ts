/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, reaction, makeObservable } from "mobx";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind, isClusterPageContext } from "../../utils";
import type { CustomResourceDefinition, CustomResourceDefinitionApi } from "../../../common/k8s-api/endpoints/custom-resource-definition.api";
import { crdApi } from "../../../common/k8s-api/endpoints/custom-resource-definition.api";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { KubeApi } from "../../../common/k8s-api/kube-api";
import { CRDResourceStore } from "./crd-resource.store";
import { KubeObject } from "../../../common/k8s-api/kube-object";

function initStore(crd: CustomResourceDefinition) {
  const objectConstructor = class extends KubeObject {
    static readonly kind = crd.getResourceKind();
    static readonly namespaced = crd.isNamespaced();
    static readonly apiBase = crd.getResourceApiBase();
  };

  const api = apiManager.getApi(objectConstructor.apiBase)
    ?? new KubeApi({ objectConstructor });

  if (!apiManager.getStore(api)) {
    apiManager.registerStore(new CRDResourceStore(api));
  }
}

export class CRDStore extends KubeObjectStore<CustomResourceDefinition, CustomResourceDefinitionApi> {
  constructor() {
    super(crdApi);

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

    for (const crd of this.items) {
      (groups[crd.getGroup()] ??= []).push(crd);
    }

    return groups;
  }

  getByGroup(group: string, pluralName: string) {
    return this.groups[group]?.find(crd => crd.getPluralName() === pluralName);
  }

  getByObject(obj: KubeObject) {
    if (!obj) return null;
    const { kind, apiVersion } = obj;

    return this.items.find(crd => (
      kind === crd.getResourceKind() && apiVersion === `${crd.getGroup()}/${crd.getVersion()}`
    ));
  }
}

export const crdStore = isClusterPageContext()
  ? new CRDStore()
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(crdStore);
}
