/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { HotbarStore } from "./hotbar-store";

const hotbarManagerInjectable = getInjectable({
  instantiate: () => HotbarStore.getInstance(),
  lifecycle: lifecycleEnum.singleton,
});

export default hotbarManagerInjectable;
