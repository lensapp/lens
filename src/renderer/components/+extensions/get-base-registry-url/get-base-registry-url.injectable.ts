/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import userPreferencesStoreInjectable from "../../../../common/user-preferences/store.injectable";
import { getBaseRegistryUrl } from "./get-base-registry-url";

const getBaseRegistryUrlInjectable = getInjectable({
  instantiate: (di) => getBaseRegistryUrl({
    getRegistryUrlPreference: () => di.inject(userPreferencesStoreInjectable).extensionRegistryUrl,
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default getBaseRegistryUrlInjectable;
