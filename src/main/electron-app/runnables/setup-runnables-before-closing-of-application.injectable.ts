/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeElectronIsReadyInjectionToken } from "../../start-main-application/runnable-tokens/before-electron-is-ready-injection-token";
import { beforeQuitOfFrontEndInjectionToken } from "../../start-main-application/runnable-tokens/before-quit-of-front-end-injection-token";
import { beforeQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";
import electronAppInjectable from "../electron-app.injectable";
import isIntegrationTestingInjectable from "../../../common/vars/is-integration-testing.injectable";
import autoUpdaterInjectable from "../features/auto-updater.injectable";
import { runManySyncFor } from "../../../common/runnable/run-many-sync-for";

const setupRunnablesBeforeClosingOfApplicationInjectable = getInjectable({
  id: "setup-closing-of-application",

  instantiate: (di) => {
    const runManySync = runManySyncFor(di);
    const runRunnablesBeforeQuitOfFrontEnd = runManySync(beforeQuitOfFrontEndInjectionToken);
    const runRunnablesBeforeQuitOfBackEnd = runManySync(beforeQuitOfBackEndInjectionToken);
    const app = di.inject(electronAppInjectable);
    const isIntegrationTesting = di.inject(isIntegrationTestingInjectable);
    const autoUpdater = di.inject(autoUpdaterInjectable);

    return {
      id: "setup-closing-of-application",
      run: () => {
        let isAutoUpdating = false;

        autoUpdater.on("before-quit-for-update", () => {
          isAutoUpdating = true;
        });

        app.on("will-quit", (event) => {
          runRunnablesBeforeQuitOfFrontEnd();

          const shouldQuitBackEnd = isIntegrationTesting || isAutoUpdating;

          if (shouldQuitBackEnd) {
            runRunnablesBeforeQuitOfBackEnd();
          } else {
            // IMPORTANT: This cannot be destructured as it would break binding of "this" for the Electron event
            event.preventDefault();
          }
        });

        return undefined;
      },
    };
  },

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupRunnablesBeforeClosingOfApplicationInjectable;
