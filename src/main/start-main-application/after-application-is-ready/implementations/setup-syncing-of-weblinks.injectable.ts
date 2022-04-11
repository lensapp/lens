/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import { syncWeblinks } from "../../../catalog-sources";
import weblinkStoreInjectable from "../../../../common/weblink-store.injectable";

const setupSyncingOfWeblinksInjectable = getInjectable({
  id: "setup-syncing-of-weblinks",

  instantiate: (di) => {
    const weblinkStore = di.inject(weblinkStoreInjectable);

    return {
      run: () => {
        syncWeblinks(weblinkStore);
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupSyncingOfWeblinksInjectable;
