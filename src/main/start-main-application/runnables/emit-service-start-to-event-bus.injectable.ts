/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appEventBusInjectable from "../../../common/app-event-bus/app-event-bus.injectable";
import { afterApplicationIsLoadedInjectionToken } from "../runnable-tokens/after-application-is-loaded-injection-token";

const emitServiceStartToEventBusInjectable = getInjectable({
  id: "emit-service-start-to-event-bus",

  instantiate: (di) => {
    const appEventBus = di.inject(appEventBusInjectable);

    return {
      id: "emit-service-start-to-event-bus",
      run: () => {
        appEventBus.emit({ name: "service", action: "start" });
      },
    };
  },

  injectionToken: afterApplicationIsLoadedInjectionToken,
});

export default emitServiceStartToEventBusInjectable;
