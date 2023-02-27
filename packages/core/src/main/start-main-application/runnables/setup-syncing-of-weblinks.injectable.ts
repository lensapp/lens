/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "../runnable-tokens/phases";
import syncWeblinksInjectable from "../../catalog-sources/sync-weblinks.injectable";

const setupSyncingOfWeblinksInjectable = getInjectable({
  id: "setup-syncing-of-weblinks",

  instantiate: (di) => ({
    run: () => {
      const syncWeblinks = di.inject(syncWeblinksInjectable);

      syncWeblinks();
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupSyncingOfWeblinksInjectable;
