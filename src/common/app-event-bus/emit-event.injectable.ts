/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appEventBusInjectable from "./app-event-bus.injectable";
import type { AppEvent } from "./event-bus";

export type EmitEvent = (event: AppEvent) => void;

const emitEventInjectable = getInjectable({
  id: "emit-event",
  instantiate: (di): EmitEvent => {
    const appEventBus = di.inject(appEventBusInjectable);

    return (event) => appEventBus.emit(event);
  },
});

export default emitEventInjectable;
