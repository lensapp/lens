/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "../../../../main/catalog/entity-registry.injectable";
import type { HotbarData } from "../common/hotbar";
import { hotbarStoreMigrationInjectionToken } from "../common/migrations-token";

const v500Beta5HotbarStoreMigrationInjectable = getInjectable({
  id: "v500-beta5-hotbar-store-migration",
  instantiate: (di) => ({
    version: "5.0.0-beta.5",
    run(store) {
      const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
      const rawHotbars = store.get("hotbars");
      const hotbars: HotbarData[] = Array.isArray(rawHotbars) ? rawHotbars : [];

      for (const hotbar of hotbars) {
        for (let i = 0; i < hotbar.items.length; i += 1) {
          const item = hotbar.items[i];

          if (!item) {
            continue;
          }

          const entity = catalogEntityRegistry.findById(item.entity.uid);

          if (!entity) {
            // Clear disabled item
            hotbar.items[i] = null;
          } else {
            // Save additional data
            item.entity = {
              ...item.entity,
              name: entity.metadata.name,
              source: entity.metadata.source,
            };
          }
        }
      }

      store.set("hotbars", hotbars);
    },
  }),
  injectionToken: hotbarStoreMigrationInjectionToken,
});

export default v500Beta5HotbarStoreMigrationInjectable;

