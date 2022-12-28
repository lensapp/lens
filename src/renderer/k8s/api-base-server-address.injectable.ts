/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBaseServerAddressInjectionToken } from "../../common/k8s-api/api-base-configs";
import windowLocationInjectable from "../../common/k8s-api/window-location.injectable";

const apiBaseServerAddressInjectable = getInjectable({
  id: "api-base-server-address",
  instantiate: (di) => {
    const { port } = di.inject(windowLocationInjectable);

    return `https://127.0.0.1:${port}`;
  },
  injectionToken: apiBaseServerAddressInjectionToken,
});

export default apiBaseServerAddressInjectable;
