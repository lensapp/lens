/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeTemplateObjectMetadata } from "../../kube-object";
import type { PodSpec } from "../pods.api";

export interface PodTemplateSpec {
  metadata?: KubeTemplateObjectMetadata<"namespace-scoped">;
  spec?: PodSpec;
}
