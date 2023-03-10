/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import hotbarStoreInjectable from "../../../../common/hotbars/store.injectable";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import setupSyncingOfGeneralCatalogEntitiesInjectable from "../../../../main/start-main-application/runnables/setup-syncing-of-general-catalog-entities.injectable";

const initHotbarStoreInjectable = getInjectable({
  id: "init-hotbar-store",
  instantiate: (di) => ({
    run: () => {
      const hotbarStore = di.inject(hotbarStoreInjectable);

      hotbarStore.load();
    },
    runAfter: setupSyncingOfGeneralCatalogEntitiesInjectable,
  }),
  injectionToken: onLoadOfApplicationInjectionToken,
});

export default initHotbarStoreInjectable;
