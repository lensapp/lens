/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { whenApplicationIsLoadingInjectionToken } from "../runnable-tokens/when-application-is-loading-injection-token";
import syncWeblinksInjectable from "../../catalog-sources/sync-weblinks.injectable";

const setupSyncingOfWeblinksInjectable = getInjectable({
  id: "setup-syncing-of-weblinks",

  instantiate: (di) => {
    const syncWeblinks = di.inject(syncWeblinksInjectable);

    return {
      run: () => {
        syncWeblinks();
      },
    };
  },

  injectionToken: whenApplicationIsLoadingInjectionToken,
});

export default setupSyncingOfWeblinksInjectable;
