/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type Conf from "conf";
import type { Migrations } from "conf/dist/source/types";
import { ExtendedMap, iter } from "../../common/utils";
import { isTestEnv } from "../../common/vars";

export function migrationLog(...args: any[]) {
  if (!isTestEnv) {
    console.log(...args);
  }
}

export interface MigrationDeclaration<T> {
  version: string,
  run(store: Conf<T>): void;
}

export function joinMigrations<T>(...declarations: MigrationDeclaration<T>[]): Migrations<T> {
  const migrations = new ExtendedMap<string, ((store: Conf<any>) => void)[]>();

  for (const decl of declarations) {
    migrations.getOrInsert(decl.version, () => []).push(decl.run);
  }

  return Object.fromEntries(
    iter.map(
      migrations,
      ([v, fns]) => [v, (store: Conf<any>) => {
        migrationLog(`Running ${v} migration for ${store.path}`);

        for (const fn of fns) {
          fn(store);
        }
      }],
    ),
  );
}
