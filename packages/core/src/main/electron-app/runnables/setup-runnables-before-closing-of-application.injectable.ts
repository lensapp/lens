/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";
import { afterQuitOfFrontEndInjectionToken, onQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/phases";
import electronAppInjectable from "../electron-app.injectable";
import isIntegrationTestingInjectable from "../../../common/vars/is-integration-testing.injectable";
import { runManySyncFor, runManyFor } from "@k8slens/run-many";
import isAutoUpdatingInjectable from "../features/is-auto-updating.injectable";

const setupRunnablesBeforeClosingOfApplicationInjectable = getInjectable({
  id: "setup-closing-of-application",

  instantiate: (di) => ({
    run: () => {
      const runManySync = runManySyncFor(di);
      const runMany = runManyFor(di);
      const runAfterQuitOfFrontEnd = runManySync(afterQuitOfFrontEndInjectionToken);
      const runOnQuitOfBackEnd = runMany(onQuitOfBackEndInjectionToken);
      const app = di.inject(electronAppInjectable);
      const isIntegrationTesting = di.inject(isIntegrationTestingInjectable);
      const isAutoUpdating = di.inject(isAutoUpdatingInjectable);

      app.on("will-quit", () => {
        runAfterQuitOfFrontEnd();

        let isAsyncQuitting = false;

        const doAsyncQuit = (event: Electron.Event, exitCode = 0) => {
          if (isAsyncQuitting) {
            return;
          }

          isAsyncQuitting = true;

          void (async () => {
            try {
              await runOnQuitOfBackEnd();
            } catch (error) {
              console.error("A beforeQuitOfBackEnd failed!!!!", error);
              exitCode = 1;
            }

            app.exit(exitCode);
          })();
        };

        app.on("will-quit", (event) => {
          runAfterQuitOfFrontEnd();
          event.preventDefault();

          if (isIntegrationTesting || isAutoUpdating.get()) {
            doAsyncQuit(event);
          }
        });

        app.on("quit", (event, exitCode) => {
          event.preventDefault();
          doAsyncQuit(event, exitCode);
        });
      });

      return undefined;
    },
  }),

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupRunnablesBeforeClosingOfApplicationInjectable;
