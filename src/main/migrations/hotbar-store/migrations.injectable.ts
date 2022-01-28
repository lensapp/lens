/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import clusterStoreInjectable from "../../../common/cluster-store/store.injectable";
import { hotbarStoreMigrationsInjectionToken } from "../../../common/hotbar-store/migrations-injectable-token";
import { joinMigrations } from "../helpers";
import version500alpha0 from "./5.0.0-alpha.0";
import version500alpha2 from "./5.0.0-alpha.2";
import version500Beta10MigrationInjectable from "./5.0.0-beta.10.injectable";
import version500Beta5MigrationInjectable from "./5.0.0-beta.5.injectable";

const hotbarStoreMigrationsInjectable = getInjectable({
  instantiate: (di) => {
    // the migrations assume that the cluster migrations have been run
    di.inject(clusterStoreInjectable);

    return joinMigrations(
      version500alpha0,
      version500alpha2,
      di.inject(version500Beta5MigrationInjectable),
      di.inject(version500Beta10MigrationInjectable),
    );
  },
  injectionToken: hotbarStoreMigrationsInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default hotbarStoreMigrationsInjectable;
