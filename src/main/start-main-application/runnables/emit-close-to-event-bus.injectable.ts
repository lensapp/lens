/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import emitAppEventInjectable from "../../../common/app-event-bus/emit-event.injectable";
import { beforeQuitOfFrontEndInjectionToken } from "../runnable-tokens/before-quit-of-front-end-injection-token";

const emitCloseToEventBusInjectable = getInjectable({
  id: "emit-close-to-event-bus",

  instantiate: (di) => {
    const emitAppEvent = di.inject(emitAppEventInjectable);

    return {
      id: "emit-close-to-event-bus",
      run: () => {
        emitAppEvent({ name: "app", action: "close" });
      },
    };
  },

  injectionToken: beforeQuitOfFrontEndInjectionToken,
});

export default emitCloseToEventBusInjectable;
