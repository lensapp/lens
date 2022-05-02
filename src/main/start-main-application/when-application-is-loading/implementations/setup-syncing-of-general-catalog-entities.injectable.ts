/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import syncGeneralCatalogEntitiesInjectable from "../../../catalog-sources/sync-general-catalog-entities.injectable";
import { whenApplicationIsLoadingInjectionToken } from "../when-application-is-loading-injection-token";

const setupSyncingOfGeneralCatalogEntitiesInjectable = getInjectable({
  id: "setup-syncing-of-general-catalog-entities",

  instantiate: (di) => {
    const syncGeneralCatalogEntities = di.inject(
      syncGeneralCatalogEntitiesInjectable,
    );

    return {
      run: () => {
        syncGeneralCatalogEntities();
      },
    };
  },

  injectionToken: whenApplicationIsLoadingInjectionToken,
});

export default setupSyncingOfGeneralCatalogEntitiesInjectable;
