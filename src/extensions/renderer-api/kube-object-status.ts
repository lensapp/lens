/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface KubeObjectStatus {
  level: KubeObjectStatusLevel;
  text: string;
  timestamp?: string;
}

export enum KubeObjectStatusLevel {
  INFO = 1,
  WARNING = 2,
  CRITICAL = 3,
}
