/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { weblinksStoreMigrationsInjectionToken } from "../../common/weblinks/migrations-injection-token";

const weblinksStoreMigrationsInjectable = getInjectable({
  instantiate: () => undefined,
  injectionToken: weblinksStoreMigrationsInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default weblinksStoreMigrationsInjectable;
