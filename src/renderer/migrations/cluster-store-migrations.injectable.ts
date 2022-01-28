/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { clusterStoreMigrationsInjectionToken } from "../../common/cluster-store/migrations-injection-token";

const clusterStoreMigrationsInjectable = getInjectable({
  instantiate: () => undefined,
  injectionToken: clusterStoreMigrationsInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default clusterStoreMigrationsInjectable;
