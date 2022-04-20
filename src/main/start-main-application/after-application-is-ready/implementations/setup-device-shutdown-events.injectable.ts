/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { runManyFor } from "../../run-many-for";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import beforeDeviceShutdownInjectable from "../../../electron-app/before-device-shutdown.injectable";
import { beforeDeviceShutdownInjectionToken } from "../../before-device-shutdown/before-device-shutdown-injection-token";

const setupDeviceShutdownEventsInjectable = getInjectable({
  id: "setup-device-shutdown-events",

  instantiate: (di) => {
    const beforeDeviceShutdown = di.inject(beforeDeviceShutdownInjectable);
    const runRunnablesBeforeDeviceShutdown = runManyFor(di)(beforeDeviceShutdownInjectionToken);

    return {
      run: () => {
        beforeDeviceShutdown(runRunnablesBeforeDeviceShutdown);
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupDeviceShutdownEventsInjectable;
