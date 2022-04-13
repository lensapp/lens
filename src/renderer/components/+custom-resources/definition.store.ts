/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, reaction, makeObservable } from "mobx";
import type { KubeObjectStoreOptions } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";
import type { CustomResourceDefinition, CustomResourceDefinitionApi } from "../../../common/k8s-api/endpoints/custom-resource-definition.api";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { InitCustomResourceStore } from "./init-resource-store.injectable";

export interface CustomResourceDefinitionStoreDependencies {
  initCustomResourceStore: InitCustomResourceStore;
}

export class CustomResourceDefinitionStore extends KubeObjectStore<CustomResourceDefinition, CustomResourceDefinitionApi> {
  constructor(
    protected readonly dependencies: CustomResourceDefinitionStoreDependencies,
    api: CustomResourceDefinitionApi,
    opts?: KubeObjectStoreOptions,
  ) {
    super(api, opts);
    makeObservable(this);
    autoBind(this);

    // auto-init stores for crd-s
    reaction(() => this.getItems(), items => items.forEach(this.dependencies.initCustomResourceStore));
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
