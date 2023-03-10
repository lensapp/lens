/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import syncGeneralCatalogEntitiesInjectable from "../../catalog-sources/sync-general-catalog-entities.injectable";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";

const setupSyncingOfGeneralCatalogEntitiesInjectable = getInjectable({
  id: "setup-syncing-of-general-catalog-entities",

  instantiate: (di) => ({
    run: () => {
      const syncGeneralCatalogEntities = di.inject(syncGeneralCatalogEntitiesInjectable);

      syncGeneralCatalogEntities();
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupSyncingOfGeneralCatalogEntitiesInjectable;
