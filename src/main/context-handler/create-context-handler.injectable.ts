/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { ContextHandler } from "./context-handler";
import createKubeAuthProxyInjectable from "../kube-auth-proxy/create-kube-auth-proxy.injectable";
import { bind } from "../../common/utils";

const createContextHandlerInjectable = getInjectable({
  instantiate: (di) => bind(ContextHandler.create, null, {
    createKubeAuthProxy: di.inject(createKubeAuthProxyInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createContextHandlerInjectable;
