/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import Server from "http-proxy";

const lensProxyServerInjectable = getInjectable({
  id: "lens-proxy-server",
  instantiate: () => new Server(),
});

export default lensProxyServerInjectable;
