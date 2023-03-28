/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const activeHotbarIdInjectable = getInjectable({
  id: "active-hotbar-id",
  instantiate: () => observable.box<string>(),
});

export default activeHotbarIdInjectable;
