/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import setupSyncingOfGeneralCatalogEntitiesInjectable from "./setup-syncing-of-general-catalog-entities.injectable";
import { onLoadOfApplicationInjectionToken } from "../runnable-tokens/on-load-of-application-injection-token";
import hotbarStoreInjectable from "../../../common/hotbars/store.injectable";

const setupHotbarStoreInjectable = getInjectable({
  id: "setup-hotbar-store",

  instantiate: (di) => ({
    id: "setup-hotbar-store",
    run: () => {
      const hotbarStore = di.inject(hotbarStoreInjectable);

      hotbarStore.load();
    },

    runAfter: di.inject(setupSyncingOfGeneralCatalogEntitiesInjectable),
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupHotbarStoreInjectable;
