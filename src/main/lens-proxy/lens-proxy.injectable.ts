/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import getClusterForRequestInjectable from "../cluster-manager/get-cluster-for-request.injectable";
import kubeApiRequestInjectable from "../proxy-functions/kube-api-request.injectable";
import shellApiRequestHandlerInjectable from "../proxy-functions/shell-api-request/shell-api-request.injectable";
import routerInjectable from "../router/router.injectable";
import { LensProxy } from "./lens-proxy";
import setProxyPortInjectable from "./set-proxy-port.injectable";

const lensProxyInjectableInjectable = getInjectable({
  instantiate: (di) => new LensProxy({
    getClusterForRequest: di.inject(getClusterForRequestInjectable),
    kubeApiRequest: di.inject(kubeApiRequestInjectable),
    shellApiRequest: di.inject(shellApiRequestHandlerInjectable),
    route: di.inject(routerInjectable).route,
    setProxyPort: di.inject(setProxyPortInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default lensProxyInjectableInjectable;
