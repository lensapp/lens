/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";
import type { Disposer } from "../../common/utils";
import type { KubeObjectDetailsProps } from "../renderer-api/components";
import type { KubeObject } from "../renderer-api/k8s-api";
import { BaseRegistry } from "./base-registry";

export interface KubeObjectDetailComponents<T extends KubeObject = KubeObject> {
  Details: React.ComponentType<KubeObjectDetailsProps<T>>;
}

export interface KubeObjectDetailRegistration<T extends KubeObject = KubeObject> {
  kind: string;
  apiVersions: string[];
  components: KubeObjectDetailComponents<T>;
  priority?: number;
}

export class KubeObjectDetailRegistry extends BaseRegistry<KubeObjectDetailRegistration> {
  add(items: KubeObjectDetailRegistration[]): Disposer;
  add<T extends KubeObject>(item: KubeObjectDetailRegistration<T>): Disposer;
  add(items: KubeObjectDetailRegistration | KubeObjectDetailRegistration[]): Disposer {
    return super.add(items);
  }

  getItemsForKind(kind: string, apiVersion: string) {
    const items = this.getItems().filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion);
    });

    return items.sort((a, b) => (b.priority ?? 50) - (a.priority ?? 50));
  }
}
