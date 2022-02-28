/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import type { KubeJsonApiData } from "../kube-json-api";
import { BaseKubeApiOptions, KubeApi } from "../kube-api";
import { autoBind } from "../../utils";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface ConfigMap {
  data: {
    [param: string]: string;
  };
}

export class ConfigMap extends KubeObject {
  static kind = "ConfigMap";
  static namespaced = true;
  static apiBase = "/api/v1/configmaps";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);

    this.data ??= {};
  }

  getKeys(): string[] {
    return Object.keys(this.data);
  }
}

export class ConfigMapApi extends KubeApi<ConfigMap> {
  constructor(params?: BaseKubeApiOptions) {
    super({
      ...(params ?? {}),
      objectConstructor: ConfigMap,
    });
  }
}

/**
 * Only available within kubernetes cluster pages
 */
export const configMapApi = isClusterPageContext()
  ? new ConfigMapApi()
  : undefined;
