/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import emitAppEventInjectable from "../../../common/app-event-bus/emit-event.injectable";
import { afterQuitOfFrontEndInjectionToken } from "../runnable-tokens/phases";

const emitCloseToEventBusInjectable = getInjectable({
  id: "emit-close-to-event-bus",

  instantiate: (di) => ({
    run: () => {
      const emitAppEvent = di.inject(emitAppEventInjectable);

      emitAppEvent({ name: "app", action: "close" });

      return undefined;
    },
  }),

  injectionToken: afterQuitOfFrontEndInjectionToken,
});

export default emitCloseToEventBusInjectable;
