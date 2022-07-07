/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Migrations } from "conf/dist/source/types";
import { getOrInsert, iter } from "../../common/utils";
import type { MigrationDeclaration } from "./declaration";
import { getInjectable } from "@ogre-tools/injectable";
import migrationLogInjectable from "./log.injectable";

const joinMigrationsInjectable = getInjectable({
  id: "join-migrations",
  instantiate: (di) => {
    const migrationLog = di.inject(migrationLogInjectable);

    return (declarations: MigrationDeclaration[]): Migrations<any> => {
      const migrations = new Map<string, MigrationDeclaration["run"][]>();

      for (const decl of declarations) {
        getOrInsert(migrations, decl.version, []).push(decl.run);
      }

      return Object.fromEntries(
        iter.map(
          migrations,
          ([v, fns]) => [v, (store) => {
            migrationLog(`Running ${v} migration for ${store.path}`);

            for (const fn of fns) {
              fn(store);
            }
          }],
        ),
      );
    };
  },
});

export default joinMigrationsInjectable;

