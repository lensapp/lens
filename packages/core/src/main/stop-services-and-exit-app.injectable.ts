/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import quitAppInjectable from "./electron-app/features/exit-app.injectable";
import loggerInjectable from "../common/logger.injectable";
import emitAppEventInjectable from "../common/app-event-bus/emit-event.injectable";

const quitAppExplicitlyInjectable = getInjectable({
  id: "quit-app-explicitly",

  instantiate: (di) => {
    const quitApp = di.inject(quitAppInjectable);
    const logger = di.inject(loggerInjectable);
    const emitAppEvent = di.inject(emitAppEventInjectable);

    return () => {
      emitAppEvent({ name: "service", action: "close" });
      logger.info("SERVICE:QUIT");
      quitApp();
    };
  },
});

export default quitAppExplicitlyInjectable;
