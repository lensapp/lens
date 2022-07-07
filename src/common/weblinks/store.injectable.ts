/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { weblinksStoreMigrationsInjectionToken } from "./migrations";
import { WeblinkStore } from "./store";

const weblinkStoreInjectable = getInjectable({
  id: "weblink-store",

  instantiate: (di) => {
    WeblinkStore.resetInstance();

    return WeblinkStore.createInstance({
      migrations: di.inject(weblinksStoreMigrationsInjectionToken),
    });
  },
});

export default weblinkStoreInjectable;
