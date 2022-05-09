/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const updateIsReadyToBeInstalledStateInjectable = getInjectable({
  id: "update-is-ready-to-be-installed-state",
  instantiate: () => observable.box<boolean>(false),
});

export default updateIsReadyToBeInstalledStateInjectable;
