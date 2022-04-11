/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appEventBusInjectable from "../../../../common/app-event-bus/app-event-bus.injectable";
import { onApplicationSoftQuitInjectionToken } from "../on-application-soft-quit-injection-token";

const emitCloseToCommandBusInjectable = getInjectable({
  id: "emit-close-to-command-bus",

  instantiate: (di) => {
    const appEventBus = di.inject(appEventBusInjectable);

    return {
      run: () => {
        appEventBus.emit({ name: "app", action: "close" });
      },
    };
  },

  injectionToken: onApplicationSoftQuitInjectionToken,
});

export default emitCloseToCommandBusInjectable;
