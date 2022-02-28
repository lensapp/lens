/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { isDevelopment } from "../vars";

const isDevelopmentInjectable = getInjectable({
  id: "is-development",
  instantiate: () => isDevelopment,
  lifecycle: lifecycleEnum.singleton,
});

export default isDevelopmentInjectable;
