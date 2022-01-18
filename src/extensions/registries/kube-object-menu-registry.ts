/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";
import { BaseRegistry } from "./base-registry";

export interface KubeObjectMenuComponents {
  MenuItem: React.ComponentType<any>;
}

export interface KubeObjectMenuRegistration {
  kind: string;
  apiVersions: string[];
  components: KubeObjectMenuComponents;
}

export class KubeObjectMenuRegistry extends BaseRegistry<KubeObjectMenuRegistration> {
  getItemsForKind(kind: string, apiVersion: string) {
    return this.getItems().filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion);
    });
  }
}
