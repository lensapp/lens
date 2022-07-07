/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { weblinksStoreMigrationsInjectionToken } from "../../common/weblinks/migrations";

const weblinksStoreMigrationsInjectable = getInjectable({
  id: "weblinks-store-migrations",
  instantiate: () => undefined,
  injectionToken: weblinksStoreMigrationsInjectionToken,
});

export default weblinksStoreMigrationsInjectable;
