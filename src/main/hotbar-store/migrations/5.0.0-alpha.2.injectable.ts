/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Cleans up a store that had the state related data stored
import type { Hotbar } from "../../../common/hotbars/types";
import * as uuid from "uuid";
import { getInjectable } from "@ogre-tools/injectable";
import { hotbarStoreMigrationInjectionToken } from "../../../common/hotbars/migrations-token";

const v500Alpha2HotbarStoreMigrationInjectable = getInjectable({
  id: "v5.0.0-alpha.2-hotbar-store-migration",
  instantiate: () => ({
    version: "5.0.0-alpha.2",
    run(store) {
      const rawHotbars = store.get("hotbars");
      const hotbars: Hotbar[] = Array.isArray(rawHotbars) ? rawHotbars : [];

      store.set("hotbars", hotbars.map(({ id, ...rest }) => ({
        id: id || uuid.v4(),
        ...rest,
      })));
    },
  }),
  injectionToken: hotbarStoreMigrationInjectionToken,
});

export default v500Alpha2HotbarStoreMigrationInjectable;

