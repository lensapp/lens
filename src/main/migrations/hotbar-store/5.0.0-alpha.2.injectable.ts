/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Hotbar } from "../../../common/hotbars/types";
import * as uuid from "uuid";
import { getInjectable } from "@ogre-tools/injectable";
import { hotbarStoreMigrationDeclarationInjectionToken } from "./migration";

const hotbarStoreV500Alpha2MigrationInjectable = getInjectable({
  id: "hotbar-store-v5.0.0-alpha.2-migration",
  instantiate: () => ( {
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
  injectionToken: hotbarStoreMigrationDeclarationInjectionToken,
});

export default hotbarStoreV500Alpha2MigrationInjectable;

