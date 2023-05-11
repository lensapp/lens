/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { hotbarStoreMigrationInjectionToken } from "../common/migrations-token";
import type { HotbarData } from "../common/hotbar";
import type { HotbarItem } from "../common/types";
import { defaultHotbarCells } from "../common/types";
import welcomeCatalogEntityInjectable from "../../../../common/catalog-entities/general-catalog-entities/implementations/welcome-catalog-entity.injectable";

const welcomePageMigration = getInjectable({
  id: "hotbar-store-welcome-page-migration",
  instantiate: (di) => ({
    version: "6.4.1",
    run: (store) => {
      const welcomeBarEntity = di.inject(welcomeCatalogEntityInjectable);

      const hotbars = (store.get("hotbars") ?? []) as HotbarData[];
      const firstHotbar = hotbars[0];

      if (!firstHotbar) {
        return;
      }

      const hasWelcomePage = Boolean(firstHotbar.items.find((hotbarItem) => hotbarItem?.entity.uid === welcomeBarEntity.metadata.uid));
      const hasSpaceForWelcomePage = firstHotbar.items.filter(Boolean).length < defaultHotbarCells;

      if (!hasWelcomePage && hasSpaceForWelcomePage) {
        const welcomePageHotbarItem: HotbarItem = {
          entity: {
            uid: welcomeBarEntity.metadata.uid,
            name: welcomeBarEntity.metadata.name,
            source: welcomeBarEntity.metadata.source,
          },
        };

        const newFirstHotbar: HotbarData = {
          ...firstHotbar,
          items: [welcomePageHotbarItem, ...firstHotbar.items.slice(0, -1)],
        };

        store.set("hotbars", [newFirstHotbar, ...hotbars.slice(1)]);
      }
    },
  }),
  injectionToken: hotbarStoreMigrationInjectionToken,
});

export default welcomePageMigration;
