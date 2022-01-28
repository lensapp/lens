/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { joinMigrations } from "../helpers";
import version514 from "./5.1.4";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { weblinksStoreMigrationsInjectionToken } from "../../../common/weblinks/migrations-injection-token";

const weblinksStoreMigrationsInjectable = getInjectable({
  instantiate: () => joinMigrations(
    version514,
  ),
  injectionToken: weblinksStoreMigrationsInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default weblinksStoreMigrationsInjectable;
