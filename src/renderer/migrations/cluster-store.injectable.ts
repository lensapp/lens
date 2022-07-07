/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { clusterStoreMigrationsInjectionToken } from "../../common/cluster-store/migrations";

const clusterStoreMigrationsInjectable = getInjectable({
  id: "cluster-store-migrations",
  instantiate: () => undefined,
  injectionToken: clusterStoreMigrationsInjectionToken,
});

export default clusterStoreMigrationsInjectable;
