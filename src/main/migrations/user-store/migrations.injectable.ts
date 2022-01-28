/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { joinMigrations } from "../helpers";
import version500Alpha3 from "./5.0.0-alpha.3";
import version503Beta1Injecable from "./5.0.3-beta.1.injectable.ts";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { userPreferencesStoreMigrationsInjectionToken } from "../../../common/user-preferences/migrations-injection-token";

const userPreferencesStoreMigrationsInjectable = getInjectable({
  instantiate: (di) => joinMigrations(
    version500Alpha3,
    di.inject(version503Beta1Injecable),
  ),
  injectionToken: userPreferencesStoreMigrationsInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default userPreferencesStoreMigrationsInjectable;
