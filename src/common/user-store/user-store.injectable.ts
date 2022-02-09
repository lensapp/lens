/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { UserStore } from "./user-store";

const userStoreInjectable = getInjectable({
  id: "user-store",
  instantiate: () => UserStore.createInstance(),
});

export default userStoreInjectable;
