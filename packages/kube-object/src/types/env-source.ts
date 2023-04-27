/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LocalObjectReference } from "../api-types";

export interface EnvSource extends LocalObjectReference {
  /**
   * Whether the object must be defined
   */
  optional?: boolean;
}
