/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensProxyPortInjectable from "../../features/lens-proxy/common/port.injectable";
import lensAuthenticatedFetchInjectable from "../fetch/lens-authed-fetch.injectable";

const requestAppVersionInjectable = getInjectable({
  id: "request-app-version",
  instantiate: (di) => {
    const fetch = di.inject(lensAuthenticatedFetchInjectable);
    const lensProxyPort = di.inject(lensProxyPortInjectable);

    return async () => {
      const response = await fetch(`https://127.0.0.1:${lensProxyPort.get()}/version`);
      const body = await response.json() as { version: string };

      return body.version;
    };
  },
});

export default requestAppVersionInjectable;
