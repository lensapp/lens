/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeTemplateObjectMetadata } from "../../kube-object";
import type { JobSpec } from "../job.api";

export interface JobTemplateSpec {
  metadata?: KubeTemplateObjectMetadata<"namespace-scoped">;
  spec?: JobSpec;
}
