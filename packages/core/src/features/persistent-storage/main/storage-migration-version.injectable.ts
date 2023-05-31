/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { InjectionToken } from "@ogre-tools/injectable";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import * as semver from "semver";
import type { MigrationDeclaration } from "../common/migrations.injectable";

/**
 * NOTE: not all stores can use this computed version, namely if any migration uses a range for
 * the version selector.
 */
const storageMigrationVersionInjectable = getInjectable({
  id: "storage-migration-version",
  instantiate: (di, token) => {
    const declarations = di.injectMany(token);

    return declarations.reduce((version, decl) => {
      if (semver.gte(decl.version, version)) {
        return decl.version;
      }

      return version;
    }, "1.0.0");
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, token: InjectionToken<MigrationDeclaration, void>) => token.id,
  }),
});

export default storageMigrationVersionInjectable;
