/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";
import { runManySyncFor } from "@k8slens/run-many";
import { getInjectable } from "@ogre-tools/injectable";
import isIntegrationTestingInjectable from "../../../common/vars/is-integration-testing.injectable";
import { afterQuitOfFrontEndInjectionToken } from "../../start-main-application/runnable-tokens/phases";
import electronAppInjectable from "../electron-app.injectable";
import quitAppInjectable from "../features/exit-app.injectable";
import isAutoUpdatingInjectable from "../features/is-auto-updating.injectable";

const setupBehaviourWhenLastWindowClosesInjectable = getInjectable({
  id: "setupBehaviourWhenLastWindowCloses",
  instantiate: (di) => ({
    run: () => {
      const runManySync = runManySyncFor(di);
      const runRunnablesAfterQuitOfFrontEnd = runManySync(afterQuitOfFrontEndInjectionToken);
      const app = di.inject(electronAppInjectable);
      const isIntegrationTesting = di.inject(isIntegrationTestingInjectable);
      const quitApp = di.inject(quitAppInjectable);
      const isAutoUpdating = di.inject(isAutoUpdatingInjectable);

      app.on("window-all-closed", () => {
        runRunnablesAfterQuitOfFrontEnd();

        if (isIntegrationTesting || isAutoUpdating.get()) {
          quitApp();
        }
      });

      return undefined;
    },
  }),
  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupBehaviourWhenLastWindowClosesInjectable;
