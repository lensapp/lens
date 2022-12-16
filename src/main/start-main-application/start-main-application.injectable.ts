/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import { runManyFor } from "../../common/runnable/run-many-for";
import { runManySyncFor } from "../../common/runnable/run-many-sync-for";
import { beforeElectronIsReadyInjectionToken } from "./runnable-tokens/before-electron-is-ready-injection-token";
import { beforeApplicationIsLoadingInjectionToken } from "./runnable-tokens/before-application-is-loading-injection-token";
import { onLoadOfApplicationInjectionToken } from "./runnable-tokens/on-load-of-application-injection-token";
import { afterApplicationIsLoadedInjectionToken } from "./runnable-tokens/after-application-is-loaded-injection-token";
import waitForElectronToBeReadyInjectable from "../electron-app/features/wait-for-electron-to-be-ready.injectable";
import { appPathsRunnablePhaseInjectionToken, showInitialWindowRunnablePhaseInjectionToken, showLoadingRunnablePhaseInjectionToken } from "./runnable-tokens/phases";

const startMainApplicationInjectable = getInjectable({
  id: "start-main-application",

  instantiate: (di) => {
    const runMany = runManyFor(di);
    const runManySync = runManySyncFor(di);
    const waitForElectronToBeReady = di.inject(waitForElectronToBeReadyInjectable);

    const appPathsRunnablePhase = runManySync(appPathsRunnablePhaseInjectionToken);
    const beforeElectronIsReady = runManySync(beforeElectronIsReadyInjectionToken);
    const beforeApplicationIsLoading = runMany(beforeApplicationIsLoadingInjectionToken);
    const showLoadingRunnablePhase = runMany(showLoadingRunnablePhaseInjectionToken);
    const onLoadOfApplication = runMany(onLoadOfApplicationInjectionToken);
    const showInitialWindowRunnablePhase = runMany(showInitialWindowRunnablePhaseInjectionToken);
    const afterApplicationIsLoaded = runMany(afterApplicationIsLoadedInjectionToken);

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
