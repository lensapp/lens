/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { EnvVarKeySelector } from "./env-var-key-selector";
import type { ObjectFieldSelector } from "./object-field-selector";
import type { ResourceFieldSelector } from "./resource-field-selector";

export interface EnvVarSource {
  configMapKeyRef?: EnvVarKeySelector;
  fieldRef?: ObjectFieldSelector;
  resourceFieldRef?: ResourceFieldSelector;
  secretKeyRef?: EnvVarKeySelector;
}
