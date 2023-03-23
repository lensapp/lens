/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensProxyPortInjectable from "../../../main/lens-proxy/lens-proxy-port.injectable";
import { lensFetchBaseUrlInjectionToken } from "../common/lens-fetch-base-url";

const lensFetchBaseUrlInjectable = getInjectable({
  id: "lens-fetch-base-url",
  instantiate: (di) => {
    const lensProxyPort = di.inject(lensProxyPortInjectable);

    return `https://127.0.0.1:${lensProxyPort.get()}`;
  },
  injectionToken: lensFetchBaseUrlInjectionToken,
});

export default lensFetchBaseUrlInjectable;
