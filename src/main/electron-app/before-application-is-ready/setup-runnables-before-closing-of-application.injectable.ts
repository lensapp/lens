/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsReadyInjectionToken } from "../../start-main-application/before-application-is-ready/before-application-is-ready-injection-token";
import { beforeQuitOfFrontEndInjectionToken } from "../../start-main-application/before-quit-of-front-end/before-quit-of-front-end-injection-token";
import { beforeQuitOfBackEndInjectionToken } from "../../start-main-application/before-quit-of-back-end/before-quit-of-back-end-injection-token";
import electronAppInjectable from "../electron-app.injectable";
import isIntegrationTestingInjectable from "../../../common/vars/is-integration-testing.injectable";
import autoUpdaterInjectable from "../features/auto-updater.injectable";
import { runManySyncFor } from "../../start-main-application/run-many-sync-for";

const setupRunnablesBeforeClosingOfApplicationInjectable = getInjectable({
  id: "setup-closing-of-application",

  instantiate: (di) => {
    const runMany = runManySyncFor(di);

    const runRunnablesBeforeQuitOfFrontEnd = runMany(
      beforeQuitOfFrontEndInjectionToken,
    );

    const runRunnablesBeforeQuitOfBackEnd = runMany(
      beforeQuitOfBackEndInjectionToken,
    );

    return {
      run: () => {
        const app = di.inject(electronAppInjectable);

        const isIntegrationTesting = di.inject(isIntegrationTestingInjectable);
        const autoUpdater = di.inject(autoUpdaterInjectable);

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
      },
    };
  },

  injectionToken: beforeApplicationIsReadyInjectionToken,
});

export default setupRunnablesBeforeClosingOfApplicationInjectable;
