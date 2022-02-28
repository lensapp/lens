/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import { BaseKubeApiOptions, KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface StorageClass {
  provisioner: string; // e.g. "storage.k8s.io/v1"
  mountOptions?: string[];
  volumeBindingMode: string;
  reclaimPolicy: string;
  parameters: {
    [param: string]: string; // every provisioner has own set of these parameters
  };
}

export class StorageClass extends KubeObject {
  static kind = "StorageClass";
  static namespaced = false;
  static apiBase = "/apis/storage.k8s.io/v1/storageclasses";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
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

/**
 * The api type for {@link StorageClass}'s
 */

export class StorageClassApi extends KubeApi<StorageClass> {
  constructor(params?: BaseKubeApiOptions) {
    super({
      ...(params ?? {}),
      objectConstructor: StorageClass,
    });
  }
}

/**
 * Only available within kubernetes cluster pages
 */
export const storageClassApi = isClusterPageContext()
  ? new StorageClassApi()
  : undefined;
