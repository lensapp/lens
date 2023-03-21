/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createProxy } from "http-proxy";
import type { ProxyIncomingMessage } from "../messages";

// NOTE: this is separate from httpProxyInjectable to fix circular dependency issues
const rawHttpProxyInjectable = getInjectable({
  id: "raw-http-proxy",
  instantiate: () => createProxy<ProxyIncomingMessage>(),
});

export default rawHttpProxyInjectable;
