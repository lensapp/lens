/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { Router } from "../router";
import routePortForwardInjectable
  from "../routes/port-forward/route-port-forward/route-port-forward.injectable";

const routerInjectable = getInjectable({
  instantiate: (di) => new Router({
    routePortForward: di.inject(routePortForwardInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default routerInjectable;
