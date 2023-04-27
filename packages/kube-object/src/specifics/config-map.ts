/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import autoBind from "auto-bind";
import type { KubeJsonApiData, KubeObjectMetadata, KubeObjectScope, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";

export interface ConfigMapData extends KubeJsonApiData<KubeObjectMetadata<KubeObjectScope.Namespace>, void, void> {
  data?: Partial<Record<string, string>>;
  binaryData?: Partial<Record<string, string>>;
  immutable?: boolean;
}

export class ConfigMap extends KubeObject<NamespaceScopedMetadata, void, void> {
  static kind = "ConfigMap";

  static namespaced = true;

  static apiBase = "/api/v1/configmaps";

  data: Partial<Record<string, string>>;

  binaryData: Partial<Record<string, string>>;

  immutable?: boolean;

  constructor({ data, binaryData, immutable, ...rest }: ConfigMapData) {
    super(rest);
    autoBind(this);

    this.data = data ?? {};
    this.binaryData = binaryData ?? {};
    this.immutable = immutable;
  }

  getKeys(): string[] {
    return Object.keys(this.data);
  }
}
