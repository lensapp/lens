/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoBind } from "../../utils";
import type { KubeObjectMetadata } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface TopologySelectorLabelRequirement {
  key: string;
  values: string[];
}

export interface TopologySelectorTerm {
  matchLabelExpressions?: TopologySelectorLabelRequirement[];
}

export interface StorageClassData extends KubeJsonApiData<KubeObjectMetadata<"cluster-scoped">, void, void> {
  allowVolumeExpansion?: boolean;
  allowedTopologies?: TopologySelectorTerm[];
  mountOptions?: string[];
  parameters?: Partial<Record<string, string>>;
  provisioner: string;
  reclaimPolicy?: string;
  volumeBindingMode?: string;
}

export class StorageClass extends KubeObject<void, void, "cluster-scoped"> {
  static readonly kind = "StorageClass";
  static readonly namespaced = false;
  static readonly apiBase = "/apis/storage.k8s.io/v1/storageclasses";

  allowVolumeExpansion?: boolean;
  allowedTopologies: TopologySelectorTerm[];
  mountOptions: string[];
  parameters: Partial<Record<string, string>>;
  provisioner: string;
  reclaimPolicy: string;
  volumeBindingMode?: string;

  constructor({
    allowVolumeExpansion,
    allowedTopologies = [],
    mountOptions = [],
    parameters = {},
    provisioner,
    reclaimPolicy = "Delete",
    volumeBindingMode,
    ...rest
  }: StorageClassData) {
    super(rest);
    autoBind(this);
    this.allowVolumeExpansion = allowVolumeExpansion;
    this.allowedTopologies = allowedTopologies;
    this.mountOptions = mountOptions;
    this.parameters = parameters;
    this.provisioner = provisioner;
    this.reclaimPolicy = reclaimPolicy;
    this.volumeBindingMode = volumeBindingMode;
  }

  isDefault() {
    const annotations = this.metadata.annotations || {};

    return (
      annotations["storageclass.kubernetes.io/is-default-class"] === "true" ||
      annotations["storageclass.beta.kubernetes.io/is-default-class"] === "true"
    );
  }

  getVolumeBindingMode() {
    return this.volumeBindingMode || "-";
  }

  getReclaimPolicy() {
    return this.reclaimPolicy || "-";
  }
}

export class StorageClassApi extends KubeApi<StorageClass, StorageClassData> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: StorageClass,
    });
  }
}

export const storageClassApi = isClusterPageContext()
  ? new StorageClassApi()
  : undefined as never;
