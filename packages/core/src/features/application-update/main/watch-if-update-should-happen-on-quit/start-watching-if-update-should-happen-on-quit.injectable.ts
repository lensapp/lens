/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "../../../../main/start-main-application/runnable-tokens/on-load-of-application-injection-token";
import watchIfUpdateShouldHappenOnQuitInjectable from "./watch-if-update-should-happen-on-quit.injectable";

const startWatchingIfUpdateShouldHappenOnQuitInjectable = getInjectable({
  id: "start-watching-if-update-should-happen-on-quit",

  instantiate: (di) => {
    const watchIfUpdateShouldHappenOnQuit = di.inject(watchIfUpdateShouldHappenOnQuitInjectable);

    return {
      id: "start-watching-if-update-should-happen-on-quit",
      run: () => {
        watchIfUpdateShouldHappenOnQuit.start();
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startWatchingIfUpdateShouldHappenOnQuitInjectable;
