/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface Condition {
  lastTransitionTime: string;
  message: string;
  observedGeneration?: number;
  reason: string;
  status: string;
  type: string;
}
