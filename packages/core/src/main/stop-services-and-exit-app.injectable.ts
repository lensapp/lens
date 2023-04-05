/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import forceAppExitInjectable from "./electron-app/features/force-app-exit.injectable";
import emitAppEventInjectable from "../common/app-event-bus/emit-event.injectable";

const stopServicesAndExitAppInjectable = getInjectable({
  id: "stop-services-and-exit-app",

  instantiate: (di) => {
    const forceAppExit = di.inject(forceAppExitInjectable);
    const emitAppEvent = di.inject(emitAppEventInjectable);

    return async () => {
      emitAppEvent({ name: "service", action: "close" });
      setTimeout(forceAppExit, 1000);
    };
  },
});

export default stopServicesAndExitAppInjectable;
