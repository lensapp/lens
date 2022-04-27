/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensProtocolRouterMainInjectable from "../../../protocol-handler/lens-protocol-router-main/lens-protocol-router-main.injectable";
import { onOpenOfUrlInjectionToken } from "../on-open-of-url-injection-token";

const openUrlUsingProtocolRouterInjectable = getInjectable({
  id: "open-url-using-protocol-router",

  instantiate: (di) => {
    const lensProtocolRouterMain = di.inject(lensProtocolRouterMainInjectable);

    return {
      run: ({ event, url }) => {
        event.preventDefault();

        lensProtocolRouterMain.route(url);
      },
    };
  },

  injectionToken: onOpenOfUrlInjectionToken,
});

export default openUrlUsingProtocolRouterInjectable;
