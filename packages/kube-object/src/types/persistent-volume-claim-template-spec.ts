/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectScope, KubeTemplateObjectMetadata } from "../api-types";
import type { PersistentVolumeSpec } from "../specifics/persistent-volume";

export interface PersistentVolumeClaimTemplateSpec {
  metadata?: KubeTemplateObjectMetadata<KubeObjectScope.Cluster>;
  spec?: PersistentVolumeSpec;
}
