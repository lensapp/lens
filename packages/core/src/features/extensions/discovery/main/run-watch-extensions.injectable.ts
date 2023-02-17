/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "../../../../main/start-main-application/runnable-tokens/on-load-of-application-injection-token";
import runLoadInitialExtensionsInjectable from "../../loader/main/run-load-initial-extensions.injectable";
import watchForExtensionsInjectable from "./watch-extensions.injectable";

const runWatchForExtensionsInjectable = getInjectable({
  id: "run-watch-for-extensions",
  instantiate: (di) => ({
    id: "run-watch-for-extensions",
    run: async () => {
      const watchForExtensions = di.inject(watchForExtensionsInjectable);

      watchForExtensions();
    },
    runAfter: di.inject(runLoadInitialExtensionsInjectable),
  }),
  injectionToken: onLoadOfApplicationInjectionToken,
});

export default runWatchForExtensionsInjectable;
