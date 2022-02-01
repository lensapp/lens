/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { v4 } from "uuid";

const uniqueIdInjectable = getInjectable({
  instantiate: () => v4,
  lifecycle: lifecycleEnum.singleton,
});

export default uniqueIdInjectable;
