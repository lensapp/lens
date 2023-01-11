/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import watchIfUpdateShouldHappenOnQuitInjectable from "./watch-if-update-should-happen-on-quit.injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../../../main/start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";

const stopWatchingIfUpdateShouldHappenOnQuitInjectable = getInjectable({
  id: "stop-watching-if-update-should-happen-on-quit",

  instantiate: (di) => {
    const watchIfUpdateShouldHappenOnQuit = di.inject(watchIfUpdateShouldHappenOnQuitInjectable);

    return {
      id: "stop-watching-if-update-should-happen-on-quit",
      run: () => void watchIfUpdateShouldHappenOnQuit.stop(),
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopWatchingIfUpdateShouldHappenOnQuitInjectable;
