/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import appEventBusInjectable from "../../../../common/app-event-bus/app-event-bus.injectable";

const emitServiceStartToCommandBusInjectable = getInjectable({
  id: "emit-service-start-to-command-bus",

  instantiate: (di) => {
    const appEventBus = di.inject(appEventBusInjectable);

    return {
      run: () => {
        appEventBus.emit({ name: "service", action: "start" });
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default emitServiceStartToCommandBusInjectable;
