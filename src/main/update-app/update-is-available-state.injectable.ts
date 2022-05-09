/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const updateIsAvailableState = getInjectable({
  id: "update-is-available-state",
  instantiate: () => observable.box<boolean>(false),
});

export default updateIsAvailableState;
