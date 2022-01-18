/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { UserStore } from "./user-store";

const userStoreInjectable = getInjectable({
  instantiate: () => UserStore.createInstance(),

  lifecycle: lifecycleEnum.singleton,
});

export default userStoreInjectable;
