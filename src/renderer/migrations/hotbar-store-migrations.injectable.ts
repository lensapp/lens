/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { hotbarStoreMigrationsInjectionToken } from "../../common/hotbar-store/migrations-injectable-token";

const hotbarStoreMigrationsInjectable = getInjectable({
  instantiate: () => undefined,
  injectionToken: hotbarStoreMigrationsInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default hotbarStoreMigrationsInjectable;
