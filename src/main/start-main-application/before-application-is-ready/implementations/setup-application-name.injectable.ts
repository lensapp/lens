/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appNameInjectable from "../../../app-paths/app-name/app-name.injectable";
import { beforeApplicationIsReadyInjectionToken } from "../before-application-is-ready-injection-token";
import setApplicationNameInjectable from "../../../electron-app/set-application-name.injectable";

const setupApplicationNameInjectable = getInjectable({
  id: "setup-application-name",

  instantiate: (di) => ({
    run: () => {
      const setApplicationName = di.inject(setApplicationNameInjectable);
      const appName = di.inject(appNameInjectable);

      setApplicationName(appName);
    },
  }),

  injectionToken: beforeApplicationIsReadyInjectionToken,
});

export default setupApplicationNameInjectable;
