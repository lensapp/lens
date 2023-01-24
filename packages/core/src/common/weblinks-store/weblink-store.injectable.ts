/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createBaseStoreInjectable from "../base-store/create-base-store.injectable";
import storeMigrationsInjectable from "../base-store/migrations.injectable";
import storeMigrationVersionInjectable from "../vars/store-migration-version.injectable";
import { weblinkStoreMigrationInjectionToken } from "./migration-token";
import { WeblinkStore } from "./weblink-store";

const weblinkStoreInjectable = getInjectable({
  id: "weblink-store",
  instantiate: (di) => new WeblinkStore({
    storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
    migrations: di.inject(storeMigrationsInjectable, weblinkStoreMigrationInjectionToken),
    createBaseStore: di.inject(createBaseStoreInjectable),
  }),
});

export default weblinkStoreInjectable;
