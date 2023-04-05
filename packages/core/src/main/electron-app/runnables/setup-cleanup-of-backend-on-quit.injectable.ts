/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";
import { onQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/phases";
import electronAppInjectable from "../electron-app.injectable";
import { runManyFor } from "@k8slens/run-many";
import { once } from "lodash";

const setupCleanupOfBackendOnQuitInjectable = getInjectable({
  id: "setup-cleanup-of-backend-on-quit",

  instantiate: (di) => ({
    run: () => {
      const runMany = runManyFor(di);
      const runOnQuitOfBackEnd = runMany(onQuitOfBackEndInjectionToken);
      const app = di.inject(electronAppInjectable);

      const doAsyncQuit = once(() => void (async () => {
        try {
          await runOnQuitOfBackEnd();
          app.exit(0);
        } catch (error) {
          console.error("A beforeQuitOfBackEnd failed!!!!", error);
          app.exit(1);
        }
      })());

      app.on("will-quit", (event) => {
        event.preventDefault();
        doAsyncQuit();
      });

      return undefined;
    },
  }),

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupCleanupOfBackendOnQuitInjectable;
