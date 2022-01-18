/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import webFrameInjectable from "./web-frame/web-frame.injectable";

const frameRoutingIdInjectable = getInjectable({
  instantiate: (di) => di.inject(webFrameInjectable).routingId,

  lifecycle: lifecycleEnum.singleton,
});

export default frameRoutingIdInjectable;
