/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { syncWeblinks } from "../../catalog-sources";
import weblinkStoreInjectable from "../../../common/weblink-store.injectable";
import catalogEntityRegistryInjectable from "../../catalog/catalog-entity-registry.injectable";
import { whenApplicationIsLoadingInjectionToken } from "../runnable-tokens/when-application-is-loading-injection-token";

const setupSyncingOfWeblinksInjectable = getInjectable({
  id: "setup-syncing-of-weblinks",

  instantiate: (di) => {
    const weblinkStore = di.inject(weblinkStoreInjectable);
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    return {
      run: () => {
        syncWeblinks({ weblinkStore, catalogEntityRegistry });
      },
    };
  },

  injectionToken: whenApplicationIsLoadingInjectionToken,
});

export default setupSyncingOfWeblinksInjectable;
