/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";
import { runManyFor } from "@k8slens/run-many";
import { getInjectable } from "@ogre-tools/injectable";
import { once } from "lodash";
import { onQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/phases";
import electronAppInjectable from "../electron-app.injectable";

const setupCleanupOnQuitOfApplicationInjectable = getInjectable({
  id: "setup-cleanup-on-quit-of-application",
  instantiate: (di) => ({
    run: () => {
      const runMany = runManyFor(di);
      const runRunnablesBeforeQuitOfBackEnd = runMany(onQuitOfBackEndInjectionToken);
      const app = di.inject(electronAppInjectable);

      const doAsyncQuit = once(() => void (async () => {
        try {
          await runRunnablesBeforeQuitOfBackEnd();
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

export default setupCleanupOnQuitOfApplicationInjectable;
