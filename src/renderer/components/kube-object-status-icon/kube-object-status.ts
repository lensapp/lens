/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { KubeObjectStatus } from "../../../extensions/renderer-api/kube-object-status";

/**
 * Type for extension API
 */
export interface KubeObjectStatusRegistration {
  kind: string;
  apiVersions: string[];
  resolve: (object: KubeObject) => KubeObjectStatus;
}

/**
 * Internal type
 */
export interface RegisteredKubeObjectStatus {
  kind: string;
  apiVersions: Set<string>;
  resolve: (object: KubeObject) => KubeObjectStatus;
}
