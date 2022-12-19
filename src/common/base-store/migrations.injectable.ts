/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { InjectionToken } from "@ogre-tools/injectable";
import { lifecycleEnum, getInjectable } from "@ogre-tools/injectable";
import type Conf from "conf/dist/source";
import type { Migrations } from "conf/dist/source/types";
import loggerInjectable from "../logger.injectable";
import { getOrInsert, iter } from "../utils";

export interface MigrationDeclaration {
  version: string;
  run(store: Conf<Partial<Record<string, unknown>>>): void;
}

const storeMigrationsInjectable = getInjectable({
  id: "store-migrations",
  instantiate: (di, token): Migrations<Record<string, unknown>> => {
    const logger = di.inject(loggerInjectable);
    const declarations = di.injectMany(token);
    const migrations = new Map<string, MigrationDeclaration["run"][]>();

    for (const decl of declarations) {
      getOrInsert(migrations, decl.version, []).push(decl.run);
    }

    return Object.fromEntries(
      iter.map(
        migrations,
        ([v, fns]) => [v, (store) => {
          logger.info(`Running ${v} migration for ${store.path}`);

          for (const fn of fns) {
            fn(store);
          }
        }],
      ),
    );
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, token: InjectionToken<MigrationDeclaration, void>) => token.id,
  }),
});

export default storeMigrationsInjectable;
