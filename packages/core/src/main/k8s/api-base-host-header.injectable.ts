/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBaseHostHeaderInjectionToken } from "../../common/k8s-api/api-base-configs";
import lensProxyPortInjectable from "../lens-proxy/lens-proxy-port.injectable";

const apiBaseHostHeaderInjectable = getInjectable({
  id: "api-base-host-header",
  instantiate: (di) => {
    const lensProxyPort = di.inject(lensProxyPortInjectable);

    return `lens.app:${lensProxyPort.get()}`;
  },
  injectionToken: apiBaseHostHeaderInjectionToken,
});

export default apiBaseHostHeaderInjectable;
