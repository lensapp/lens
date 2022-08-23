/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { EventEmitter } from "../event-emitter";

export interface AppEvent {
  name: string;
  action: string;
  destination?: string;
  params?: Record<string, any>;
}

export const appEventBus = new EventEmitter<[AppEvent]>();
