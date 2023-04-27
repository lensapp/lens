/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectScope, KubeTemplateObjectMetadata } from "../api-types";
import type { JobSpec } from "../specifics/job";

export interface JobTemplateSpec {
  metadata?: KubeTemplateObjectMetadata<KubeObjectScope.Namespace>;
  spec?: JobSpec;
}
