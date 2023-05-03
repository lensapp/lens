/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFrontEndRouteInjectable } from "../../../common/front-end-routing/front-end-route-injection-token";

const preferencesRouteInjectable = getFrontEndRouteInjectable({
  id: "preferences-route",
  path: "/preferences/:preferenceTabId?",
  clusterFrame: false,
});

export default preferencesRouteInjectable;
