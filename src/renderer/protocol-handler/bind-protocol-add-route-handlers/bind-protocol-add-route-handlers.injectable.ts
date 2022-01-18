/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import attemptInstallByInfoInjectable from "../../components/+extensions/attempt-install-by-info/attempt-install-by-info.injectable";
import { bindProtocolAddRouteHandlers } from "./bind-protocol-add-route-handlers";
import lensProtocolRouterRendererInjectable from "../lens-protocol-router-renderer/lens-protocol-router-renderer.injectable";

const bindProtocolAddRouteHandlersInjectable = getInjectable({
  instantiate: (di) =>
    bindProtocolAddRouteHandlers({
      attemptInstallByInfo: di.inject(attemptInstallByInfoInjectable),
      lensProtocolRouterRenderer: di.inject(
        lensProtocolRouterRendererInjectable,
      ),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default bindProtocolAddRouteHandlersInjectable;
