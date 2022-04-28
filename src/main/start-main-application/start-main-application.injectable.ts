/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import electronAppInjectable from "../electron-app/electron-app.injectable";
import { beforeApplicationIsReadyInjectionToken } from "./before-application-is-ready/before-application-is-ready-injection-token";
import { afterApplicationIsReadyInjectionToken } from "./after-application-is-ready/after-application-is-ready-injection-token";
import { runManyFor } from "./run-many-for";
import { runManySyncFor } from "./run-many-sync-for";

const startMainApplicationInjectable = getInjectable({
  id: "start-main-application",

  instantiate: (di) => {
    const runMany = runManyFor(di);
    const runManySync = runManySyncFor(di);
    const app = di.inject(electronAppInjectable);

    return async () => {
      // Stuff happening before application is ready needs to be synchronous because of
      // https://github.com/electron/electron/issues/21370
      runManySync(beforeApplicationIsReadyInjectionToken)();

      await app.whenReady();

      await runMany(afterApplicationIsReadyInjectionToken)();
    };
  },
});

export default startMainApplicationInjectable;



