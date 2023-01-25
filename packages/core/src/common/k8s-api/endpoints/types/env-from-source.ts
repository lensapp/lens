/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { EnvSource } from "./env-source";

export interface EnvFromSource {
  configMapRef?: EnvSource;
  /**
   * An identifier to prepend to each key in the ConfigMap. Must be a C_IDENTIFIER.
   */
  prefix?: string;
  secretRef?: EnvSource;
}
