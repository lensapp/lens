/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";
import type { KubeObject } from "../../../../../common/k8s-api/kube-object";

export interface KubeObjectMenuItemProps {
  object: KubeObject;
  toolbar?: boolean;
}

export interface KubeObjectMenuComponents {
  MenuItem: React.ComponentType<KubeObjectMenuItemProps>;
}

export interface KubeObjectMenuRegistration {
  kind: string;
  apiVersions: string[];
  components: KubeObjectMenuComponents;
}
