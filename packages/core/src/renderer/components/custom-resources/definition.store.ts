/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, makeObservable } from "mobx";
import type { KubeObjectStoreDependencies, KubeObjectStoreOptions } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { CustomResourceDefinition, KubeObject } from "@k8slens/kube-object";
import autoBind from "auto-bind";
import type { CustomResourceDefinitionApi } from "../../../common/k8s-api/endpoints";

export class CustomResourceDefinitionStore extends KubeObjectStore<CustomResourceDefinition, CustomResourceDefinitionApi> {
  constructor(
    dependencies: KubeObjectStoreDependencies,
    api: CustomResourceDefinitionApi,
    opts?: KubeObjectStoreOptions,
  ) {
    super(dependencies, api, opts);
    makeObservable(this);
    autoBind(this);
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
    const { kind, apiVersion } = obj;

    return this.items.find(crd => (
      kind === crd.getResourceKind() && apiVersion === `${crd.getGroup()}/${crd.getVersion()}`
    ));
  }
}
