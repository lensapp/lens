/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appEventBusInjectable from "./app-event-bus.injectable";

const emitEventInjectable = getInjectable({
  id: "emit-event",
  instantiate: (di) => di.inject(appEventBusInjectable).emit,
});

export default emitEventInjectable;
