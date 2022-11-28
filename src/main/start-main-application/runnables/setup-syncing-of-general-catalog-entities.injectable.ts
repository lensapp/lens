/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import syncGeneralCatalogEntitiesInjectable from "../../catalog-sources/sync-general-catalog-entities.injectable";
import { onLoadOfApplicationInjectionToken } from "../runnable-tokens/on-load-of-application-injection-token";

const setupSyncingOfGeneralCatalogEntitiesInjectable = getInjectable({
  id: "setup-syncing-of-general-catalog-entities",

  instantiate: (di) => {
    const syncGeneralCatalogEntities = di.inject(
      syncGeneralCatalogEntitiesInjectable,
    );

    return {
      id: "setup-syncing-of-general-catalog-entities",
      run: () => {
        syncGeneralCatalogEntities();
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupSyncingOfGeneralCatalogEntitiesInjectable;
