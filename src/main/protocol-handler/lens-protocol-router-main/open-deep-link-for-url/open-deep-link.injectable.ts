/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensProtocolRouterMainInjectable from "../lens-protocol-router-main.injectable";

const openDeepLinkInjectable = getInjectable({
  id: "open-deep-link",

  instantiate: (di) => {
    const protocolRouter = di.inject(lensProtocolRouterMainInjectable);

    return async (url: string) => {
      await protocolRouter.route(url);
    };
  },
});

export default openDeepLinkInjectable;
