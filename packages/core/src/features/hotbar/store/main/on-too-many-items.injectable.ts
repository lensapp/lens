/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { noop } from "../../../../common/utils";
import { onTooManyHotbarItemsInjectionToken } from "../common/on-too-many-items";

const onTooManyHotbarItemsInjectable = getInjectable({
  id: "on-too-many-hotbar-items",
  instantiate: () => noop,
  injectionToken: onTooManyHotbarItemsInjectionToken,
});

export default onTooManyHotbarItemsInjectable;
