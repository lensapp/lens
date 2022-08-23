/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  getInjectable,
} from "@ogre-tools/injectable";
import { UserStore } from "../../../../common/user-store";
import { getBaseRegistryUrl } from "./get-base-registry-url";

const getBaseRegistryUrlInjectable = getInjectable({
  id: "get-base-registry-url",

  instantiate: () => getBaseRegistryUrl({
    // TODO: use injection
    getRegistryUrlPreference: () => UserStore.getInstance().extensionRegistryUrl,
  }),
});

export default getBaseRegistryUrlInjectable;
