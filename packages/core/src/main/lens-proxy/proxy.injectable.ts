/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createProxy } from "http-proxy";

const proxyInjectable = getInjectable({
  id: "proxy",
  instantiate: () => createProxy(),
});

export default proxyInjectable;
