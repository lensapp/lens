/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../../../electron-app/electron-app.injectable";
import appNameInjectable from "../../../app-paths/app-name/app-name.injectable";
import { beforeApplicationIsReadyInjectionToken } from "../before-application-is-ready-injection-token";

const setupApplicationNameInjectable = getInjectable({
  id: "setup-application-name",

  instantiate: (di) => ({
    run: () => {
      const app = di.inject(electronAppInjectable);
      const appName = di.inject(appNameInjectable);

      app.setName(appName);
    },
  }),

  injectionToken: beforeApplicationIsReadyInjectionToken,
});

export default setupApplicationNameInjectable;
