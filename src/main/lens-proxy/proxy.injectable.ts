/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import httpProxy from "http-proxy";
import getClusterForRequestInjectable from "../cluster/get-cluster-for-request.injectable";
import routerInjectable from "../router/router.injectable";
import { kubeApiUpgradeRequest } from "./kube-api-upgrade-request";
import { LensProxy } from "./lens-proxy";
import lensProxyLoggerInjectable from "./logger.injectable";
import lensProxyPortInjectable from "./port.injectable";
import shellApiRequestHandlerInjectable from "./shell-api/handler.injectable";

const lensProxyInjectable = getInjectable({
  id: "lens-proxy",
  instantiate: (di) => new LensProxy({
    getClusterForRequest: di.inject(getClusterForRequestInjectable),
    kubeApiUpgradeRequest,
    logger: di.inject(lensProxyLoggerInjectable),
    proxy: httpProxy.createProxy(),
    proxyPort: di.inject(lensProxyPortInjectable),
    router: di.inject(routerInjectable),
    shellApiRequest: di.inject(shellApiRequestHandlerInjectable),
  }),
});

export default lensProxyInjectable;
