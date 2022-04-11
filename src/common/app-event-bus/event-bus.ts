/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { EventEmitter } from "../event-emitter";

export interface Keyable { [key: string]: any }
export interface LensAppEvent {
  type: "APP_EVENT";
  name: string;
  action: string;
  params?: Keyable;
}

export interface TelemetryEvent {
  type: "TELEMETRY_EVENT";
  name: string;
  credentials: Keyable;
  event: Keyable;
}

export interface LensProxyEvent {
  type: "LENS_PROXY_EVENT";
  name: string;
  action: string;
  params: {
    port: number;
  };
}

export type AppEvent = LensAppEvent | TelemetryEvent | LensProxyEvent;

export const appEventBus = new EventEmitter<[AppEvent]>();
