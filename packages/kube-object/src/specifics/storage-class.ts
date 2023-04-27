/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import autoBind from "auto-bind";
import type { KubeJsonApiData, KubeObjectMetadata, KubeObjectScope, ClusterScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";

export interface TopologySelectorLabelRequirement {
  key: string;
  values: string[];
}

export interface TopologySelectorTerm {
  matchLabelExpressions?: TopologySelectorLabelRequirement[];
}

export interface StorageClassData extends KubeJsonApiData<KubeObjectMetadata<KubeObjectScope.Cluster>, void, void> {
  allowVolumeExpansion?: boolean;
  allowedTopologies?: TopologySelectorTerm[];
  mountOptions?: string[];
  parameters?: Partial<Record<string, string>>;
  provisioner: string;
  reclaimPolicy?: string;
  volumeBindingMode?: string;
}

export class StorageClass extends KubeObject<ClusterScopedMetadata, void, void> {
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
