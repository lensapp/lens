/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { EnvVarSource } from "./env-var-source";

export interface EnvVar {
  name: string;
  value?: string;
  valueFrom?: EnvVarSource;
}
