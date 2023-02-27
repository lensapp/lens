/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import { runManyFor } from "../../common/runnable/run-many-for";
import { runManySyncFor } from "../../common/runnable/run-many-sync-for";
import * as phases from "./runnable-tokens/phases";
import waitForElectronToBeReadyInjectable from "../electron-app/features/wait-for-electron-to-be-ready.injectable";

const startMainApplicationInjectable = getInjectable({
  id: "start-main-application",

  instantiate: (di) => {
    const runMany = runManyFor(di);
    const runManySync = runManySyncFor(di);
    const waitForElectronToBeReady = di.inject(waitForElectronToBeReadyInjectable);

    const appPathsRunnablePhase = runManySync(phases.appPathsRunnablePhaseInjectionToken);
    const beforeElectronIsReady = runManySync(phases.beforeElectronIsReadyInjectionToken);
    const beforeApplicationIsLoading = runMany(phases.beforeApplicationIsLoadingInjectionToken);
    const showLoadingRunnablePhase = runMany(phases.showLoadingRunnablePhaseInjectionToken);
    const onLoadOfApplication = runMany(phases.onLoadOfApplicationInjectionToken);
    const showInitialWindowRunnablePhase = runMany(phases.showInitialWindowRunnablePhaseInjectionToken);
    const afterApplicationIsLoaded = runMany(phases.afterApplicationIsLoadedInjectionToken);

    return () => {
      // Stuff happening before application is ready needs to be synchronous because of
      // https://github.com/electron/electron/issues/21370
      appPathsRunnablePhase();
      beforeElectronIsReady();

      return (async () => {
        await waitForElectronToBeReady();
        await beforeApplicationIsLoading();
        await showLoadingRunnablePhase();
        await onLoadOfApplication();
        await showInitialWindowRunnablePhase();
        await afterApplicationIsLoaded();
      })();
    };
  },
});

export default startMainApplicationInjectable;
