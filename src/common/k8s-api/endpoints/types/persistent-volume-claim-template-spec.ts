/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeTemplateObjectMetadata } from "../../kube-object";
import type { PersistentVolumeSpec } from "../persistent-volume.api";

export interface PersistentVolumeClaimTemplateSpec {
  metadata?: KubeTemplateObjectMetadata<"cluster-scoped">;
  spec?: PersistentVolumeSpec;
}
