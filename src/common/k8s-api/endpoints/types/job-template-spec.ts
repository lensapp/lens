/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectScope, KubeTemplateObjectMetadata } from "../../kube-object";
import type { JobSpec } from "../job.api";

export interface JobTemplateSpec {
  metadata?: KubeTemplateObjectMetadata<KubeObjectScope.Namespace>;
  spec?: JobSpec;
}
