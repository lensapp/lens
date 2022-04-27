/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import hotbarStoreInjectable from "../../../../common/hotbar-store.injectable";
import setupSyncingOfGeneralCatalogEntitiesInjectable from "./setup-syncing-of-general-catalog-entities.injectable";

const setupHotbarStoreInjectable = getInjectable({
  id: "setup-hotbar-store",

  instantiate: (di) => ({
    run: () => {
      const hotbarStore = di.inject(hotbarStoreInjectable);

      hotbarStore.load();
    },

    runAfter: di.inject(setupSyncingOfGeneralCatalogEntitiesInjectable),
  }),

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupHotbarStoreInjectable;
