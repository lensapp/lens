/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBaseHostHeaderInjectionToken } from "../../common/k8s-api/api-base-configs";
import windowLocationInjectable from "../../common/k8s-api/window-location.injectable";

const apiBaseHostHeaderInjectable = getInjectable({
  id: "api-base-host-header",
  instantiate: (di) => di.inject(windowLocationInjectable).host,
  injectionToken: apiBaseHostHeaderInjectionToken,
});

export default apiBaseHostHeaderInjectable;
