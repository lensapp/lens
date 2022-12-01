/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensProxyPortInjectable from "../../main/lens-proxy/lens-proxy-port.injectable";
import lensAuthenticatedFetchInjectable from "../fetch/lens-authed-fetch.injectable";

const requestAppVersionInjectable = getInjectable({
  id: "request-app-version",
  instantiate: (di) => {
    const lensAuthenticatedFetch = di.inject(lensAuthenticatedFetchInjectable);
    const lensProxyPort = di.inject(lensProxyPortInjectable);

    return async () => {
      const response = await lensAuthenticatedFetch(`http://127.0.0.1:${lensProxyPort.get()}/version`);
      const body = await response.json() as { version: string };

      return body.version;
    };
  },
});

export default requestAppVersionInjectable;
