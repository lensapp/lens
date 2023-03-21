/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IncomingMessage, ServerResponse } from "http";
import { getRequestId } from "../helpers";
import proxyRetryInjectable from "./retry.injectable";

const onProxyResInjectable = getInjectable({
  id: "on-proxy-res",
  instantiate: (di) => {
    const proxyRetry = di.inject(proxyRetryInjectable);

    return (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
      proxyRetry.clearCount(getRequestId(req));

      proxyRes.on("aborted", () => { // happens when proxy target aborts connection
        res.end();
      });
    };
  },
});

export default onProxyResInjectable;
