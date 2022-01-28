/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { uniqueId } from "lodash";

const uniqueIdInjectable = getInjectable({
  instantiate: () => uniqueId,
  lifecycle: lifecycleEnum.singleton,
});

export default uniqueIdInjectable;
