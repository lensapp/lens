/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectScope, KubeTemplateObjectMetadata } from "../api-types";
import type { PodSpec } from "../specifics/pod";

export interface PodTemplateSpec {
  metadata?: KubeTemplateObjectMetadata<KubeObjectScope.Namespace>;
  spec?: PodSpec;
}
