/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { userStoreFileNameMigrationInjectionToken } from "../../common/user-preferences/file-name-migration-injection-token";
import { noop } from "../utils";

const userStoreFileNameMigratiionInjectable = getInjectable({
  instantiate: () => noop,
  injectionToken: userStoreFileNameMigrationInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default userStoreFileNameMigratiionInjectable;
