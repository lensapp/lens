/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import hotbarStoreInjectable from "../../../../common/hotbars/store.injectable";
import { onLoadOfApplicationInjectionToken } from "../../../../main/start-main-application/runnable-tokens/on-load-of-application-injection-token";
import setupSyncingOfGeneralCatalogEntitiesInjectable from "../../../../main/start-main-application/runnables/setup-syncing-of-general-catalog-entities.injectable";

const initHotbarStoreInjectable = getInjectable({
  id: "init-hotbar-store",
  instantiate: (di) => {
    const hotbarStore = di.inject(hotbarStoreInjectable);

    return {
      id: "init-hotbar-store",
      run: () => {
        hotbarStore.load();
      },
      runAfter: di.inject(setupSyncingOfGeneralCatalogEntitiesInjectable),
    };
  },
  injectionToken: onLoadOfApplicationInjectionToken,
});

export default initHotbarStoreInjectable;
