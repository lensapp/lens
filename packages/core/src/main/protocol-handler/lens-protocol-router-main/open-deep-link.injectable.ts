/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensProtocolRouterMainInjectable from "./lens-protocol-router-main.injectable";

const openDeepLinkInjectable = getInjectable({
  id: "open-deep-link",
  instantiate: (di) => async (url: string) => di.inject(lensProtocolRouterMainInjectable).route(url),
});

export default openDeepLinkInjectable;
