/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBaseServerAddressInjectionToken } from "../../common/k8s-api/api-base-configs";
import lensProxyPortInjectable from "../lens-proxy/lens-proxy-port.injectable";

const apiBaseServerAddressInjectable = getInjectable({
  id: "api-base-server-address",
  instantiate: (di) => {
    const lensProxyPort = di.inject(lensProxyPortInjectable);

    return `https://127.0.0.1:${lensProxyPort.get()}`;
  },
  injectionToken: apiBaseServerAddressInjectionToken,
});

export default apiBaseServerAddressInjectable;
