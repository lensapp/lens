/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Cluster store migrations

import { joinMigrations } from "../helpers";
import snap from "./snap";

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import version360Beta1InjectableInjectable from "./3.6.0-beta.1.injectable";
import version500Beta10MigrationInjectable from "./5.0.0-beta.10.injectable";
import version500Beta13MigrationInjectable from "./5.0.0-beta.13.injectable";
import { clusterStoreMigrationsInjectionToken } from "../../../common/cluster-store/migrations-injection-token";

const clusterStoreMigrationsInjectable = getInjectable({
  instantiate: (di) => joinMigrations(
    di.inject(version360Beta1InjectableInjectable),
    di.inject(version500Beta10MigrationInjectable),
    di.inject(version500Beta13MigrationInjectable),
    snap,
  ),
  injectionToken: clusterStoreMigrationsInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default clusterStoreMigrationsInjectable;
