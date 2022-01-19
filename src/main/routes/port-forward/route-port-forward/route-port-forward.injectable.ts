/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { routePortForward } from "./route-port-forward";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import createPortForwardInjectable from "../create-port-forward.injectable";

const routePortForwardInjectable = getInjectable({
  instantiate: (di) => routePortForward({
    createPortForward: di.inject(createPortForwardInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default routePortForwardInjectable;
