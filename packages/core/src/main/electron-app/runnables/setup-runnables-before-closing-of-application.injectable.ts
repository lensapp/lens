/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";
import { afterQuitOfFrontEndInjectionToken, beforeQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/phases";
import electronAppInjectable from "../electron-app.injectable";
import isIntegrationTestingInjectable from "../../../common/vars/is-integration-testing.injectable";
import { runManySyncFor, runManyFor } from "@k8slens/run-many";
import quitAppInjectable from "../features/exit-app.injectable";

const setupRunnablesBeforeClosingOfApplicationInjectable = getInjectable({
  id: "setup-closing-of-application",

  instantiate: (di) => ({
    run: () => {
      const runManySync = runManySyncFor(di);
      const runMany = runManyFor(di);
      const runRunnablesAfterQuitOfFrontEnd = runManySync(afterQuitOfFrontEndInjectionToken);
      const runRunnablesBeforeQuitOfBackEnd = runMany(beforeQuitOfBackEndInjectionToken);
      const app = di.inject(electronAppInjectable);
      const isIntegrationTesting = di.inject(isIntegrationTestingInjectable);
      const quitApp = di.inject(quitAppInjectable);

      let isAsyncQuitting = false;

      const doAsyncQuit = () => {
        if (isAsyncQuitting) {
          return;
        }

        isAsyncQuitting = true;

        void (async () => {
          try {
            console.log("before runRunnablesBeforeQuitOfBackEnd");
            await runRunnablesBeforeQuitOfBackEnd();
            console.log("after runRunnablesBeforeQuitOfBackEnd");
            app.exit(0);
          } catch (error) {
            console.error("A beforeQuitOfBackEnd failed!!!!", error);
            app.exit(1);
          }
        })();
      };

      app.on("window-all-closed", () => {
        console.log(`app.on("window-all-closed")`);
        runRunnablesAfterQuitOfFrontEnd();

        if (isIntegrationTesting) {
          quitApp();
        }
      });

      app.on("will-quit", (event) => {
        console.log(`app.on("will-quit")`);
        event.preventDefault();
        doAsyncQuit();
      });

      app.on("quit", () => {
        console.log(`app.on("quit")`);
      });

      return undefined;
    },
  }),

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupRunnablesBeforeClosingOfApplicationInjectable;
