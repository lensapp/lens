/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import watchIfUpdateShouldHappenOnQuitInjectable from "./watch-if-update-should-happen-on-quit.injectable";

const startWatchingIfUpdateShouldHappenOnQuitInjectable = getInjectable({
  id: "start-watching-if-update-should-happen-on-quit",

  instantiate: (di) => ({
    run: () => {
      const watchIfUpdateShouldHappenOnQuit = di.inject(watchIfUpdateShouldHappenOnQuitInjectable);

      watchIfUpdateShouldHappenOnQuit.start();
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startWatchingIfUpdateShouldHappenOnQuitInjectable;
