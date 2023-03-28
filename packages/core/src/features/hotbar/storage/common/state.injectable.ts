/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { Hotbar } from "./hotbar";

const hotbarsStateInjectable = getInjectable({
  id: "hotbars-state",
  instantiate: () => observable.map<string, Hotbar>(),
});

export default hotbarsStateInjectable;
