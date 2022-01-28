/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MigrationDeclaration } from "../helpers";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "../../catalog/entity-registry.injectable";
import type { HotbarStoreModel } from "../../../common/hotbar-store/store";

const version500Beta5MigrationInjectable = getInjectable({
  instantiate: (di) => ({
    version: "5.0.0-beta.5",
    run(store) {
      const rawHotbars = store.get("hotbars");
      const hotbars: HotbarStoreModel["hotbars"] = Array.isArray(rawHotbars) ? rawHotbars : [];
      const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

      for (const hotbar of hotbars) {
        for (let i = 0; i < hotbar.items.length; i += 1) {
          const item = hotbar.items[i];
          const entity = catalogEntityRegistry.items.find((entity) => entity.metadata.uid === item?.entity.uid);

          if (!entity) {
          // Clear disabled item
            hotbar.items[i] = null;
          } else {
          // Save additional data
            hotbar.items[i].entity = {
              ...item.entity,
              name: entity.metadata.name,
              source: entity.metadata.source,
            };
          }
        }
      }

      store.set("hotbars", hotbars);
    },
  } as MigrationDeclaration<HotbarStoreModel>),
  lifecycle: lifecycleEnum.singleton,
});

export default version500Beta5MigrationInjectable;
