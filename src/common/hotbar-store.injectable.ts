/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { HotbarStore } from "./hotbar-store";

const hotbarManagerInjectable = getInjectable({
  id: "hotbar-manager",
  instantiate: () => HotbarStore.getInstance(),
});

export default hotbarManagerInjectable;
