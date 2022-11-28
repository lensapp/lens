/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { LensProxy } from "./lens-proxy";
import { kubeApiUpgradeRequest } from "./proxy-functions";
import routerInjectable from "../router/router.injectable";
import httpProxy from "http-proxy";
import clusterManagerInjectable from "../cluster/manager.injectable";
import shellApiRequestInjectable from "./proxy-functions/shell-api-request/shell-api-request.injectable";
import lensProxyPortInjectable from "./lens-proxy-port.injectable";
import contentSecurityPolicyInjectable from "../../common/vars/content-security-policy.injectable";
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import loggerInjectable from "../../common/logger.injectable";

const lensProxyInjectable = getInjectable({
  id: "lens-proxy",

  instantiate: (di) => new LensProxy({
    router: di.inject(routerInjectable),
    proxy: httpProxy.createProxy(),
    kubeApiUpgradeRequest,
    shellApiRequest: di.inject(shellApiRequestInjectable),
    getClusterForRequest: di.inject(clusterManagerInjectable).getClusterForRequest,
    lensProxyPort: di.inject(lensProxyPortInjectable),
    contentSecurityPolicy: di.inject(contentSecurityPolicyInjectable),
    emitAppEvent: di.inject(emitAppEventInjectable),
    logger: di.inject(loggerInjectable),
  }),
});

export default lensProxyInjectable;
