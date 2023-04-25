/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import appEventBusInjectable from "../../common/app-event-bus/app-event-bus.injectable";
import { asLegacyGlobalForExtensionApi } from "@k8slens/legacy-global-di";
import type { AppEvent } from "../../common/app-event-bus/event-bus";
import type { EventEmitter, EventEmitterCallback, EventEmitterOptions } from "@k8slens/event-emitter";

export type {
  AppEvent,
  EventEmitter,
  EventEmitterCallback,
  EventEmitterOptions,
};

export const appEventBus = asLegacyGlobalForExtensionApi(appEventBusInjectable);
