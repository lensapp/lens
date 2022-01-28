/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { weblinksStoreMigrationsInjectionToken } from "./migrations-injection-token";
import { WeblinkStore } from "./store";

const weblinksStoreInjectable = getInjectable({
  instantiate: (di) => new WeblinkStore({
    migrations: di.inject(weblinksStoreMigrationsInjectionToken),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default weblinksStoreInjectable;
