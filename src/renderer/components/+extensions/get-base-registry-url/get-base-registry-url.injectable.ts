/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  getInjectable,
  lifecycleEnum,
} from "@ogre-tools/injectable";
import { UserStore } from "../../../../common/user-store";
import { getBaseRegistryUrl } from "./get-base-registry-url";

const getBaseRegistryUrlInjectable = getInjectable({
  instantiate: () => getBaseRegistryUrl({
    // TODO: use injection
    getRegistryUrlPreference: () => UserStore.getInstance().extensionRegistryUrl,
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default getBaseRegistryUrlInjectable;
