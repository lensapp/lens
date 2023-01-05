/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const topBarStateInjectable = getInjectable({
  id: "top-bar-state",
  instantiate: () => observable.object({
    prevEnabled: false,
    nextEnabled: false,
  }),
});

export default topBarStateInjectable;
