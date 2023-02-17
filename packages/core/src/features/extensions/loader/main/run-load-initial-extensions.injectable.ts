/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "../../../../main/library";
import loadInitialExtensionsInjectable from "../../discovery/main/load-initial-extensions.injectable";
import runAutoInitExtensionsInjectable from "./run-auto-init-extensions.injectable";

const runLoadInitialExtensionsInjectable = getInjectable({
  id: "run-load-initial-extensions",
  instantiate: (di) => ({
    id: "run-load-initial-extensions",
    run: async () => {
      const loadInitialExtensions = di.inject(loadInitialExtensionsInjectable);

      await loadInitialExtensions();
    },
    runAfter: di.inject(runAutoInitExtensionsInjectable),
  }),
  injectionToken: onLoadOfApplicationInjectionToken,
});

export default runLoadInitialExtensionsInjectable;
