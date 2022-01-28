/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Cleans up a store that had the state related data stored
import * as uuid from "uuid";
import type { HotbarStoreModel } from "../../../common/hotbar-store/store";
import type { MigrationDeclaration } from "../helpers";

export default {
  version: "5.0.0-alpha.2",
  run(store) {
    const rawHotbars = store.get("hotbars");
    const hotbars = Array.isArray(rawHotbars) ? rawHotbars : [];

    store.set("hotbars", hotbars.map((hotbar) => ({
      id: uuid.v4(),
      ...hotbar,
    })));
  },
} as MigrationDeclaration<HotbarStoreModel>;
