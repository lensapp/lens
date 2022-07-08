/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * The shape of an event that can be emitted for telemetry purposes
 */
export interface AppEvent {
  name: string;
  action: string;
  destination?: string;
  params?: Record<string, any>;
}
