/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const badgeHasTextSelectedStateInjectable = getInjectable({
  id: "badge-has-text-selected-state",
  instantiate: () => observable.box(false),
});

export default badgeHasTextSelectedStateInjectable;
