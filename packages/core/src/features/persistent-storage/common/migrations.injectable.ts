/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { InjectionToken } from "@ogre-tools/injectable";
import { lifecycleEnum, getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { getOrInsert, iter, object } from "@k8slens/utilities";

export type AllowedSetValue<T> = T extends (...args: any[]) => any
  ? never
  : T extends undefined | symbol
    ? never
    : T;

export interface MigrationStore {
  readonly path: string;
  get(key: string): unknown;
  delete(key: string): void;
  has(key: string): boolean;
  clear(): void;
  set<T>(key: string, value: AllowedSetValue<T>): void;
}

export type Migrations = Partial<Record<string, (store: MigrationStore) => void>>;

export interface MigrationDeclaration {
  version: string;
  run(store: MigrationStore): void;
}

const persistentStorageMigrationsInjectable = getInjectable({
  id: "persistent-storage-migrations",
  instantiate: (di, token) => {
    const logger = di.inject(loggerInjectionToken);
    const declarations = di.injectMany(token);
    const migrations = new Map<string, MigrationDeclaration["run"][]>();

    for (const decl of declarations) {
      getOrInsert(migrations, decl.version, []).push(decl.run);
    }

    return iter.chain(migrations.entries())
      .map(([v, fns]) => [v, (store: MigrationStore) => {
        logger.info(`Running ${v} migration for ${store.path}`);

        for (const fn of fns) {
          fn(store);
        }
      }] as const)
      .collect(object.fromEntries);
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, token: InjectionToken<MigrationDeclaration, void>) => token.id,
  }),
});

export default persistentStorageMigrationsInjectable;
