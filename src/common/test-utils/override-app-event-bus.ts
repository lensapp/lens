/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer, Injectable } from "@ogre-tools/injectable";
import type { AppEvent } from "../app-event-bus/event-bus";
import type { EventEmitter } from "../event-emitter";

export function overrideAppEventBusInjectable(di: DiContainer, appEventBusInjectable: Injectable<EventEmitter<[AppEvent]>, unknown, void>) {
  const emitEvent: (event: AppEvent) => void = jest.fn();

  di.override(appEventBusInjectable, () => ({
    emit: emitEvent,
  }));

  return emitEvent;
}
