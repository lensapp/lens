/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { LensProxy } from "./lens-proxy";
import routerInjectable from "../router/router.injectable";
import httpProxy from "http-proxy";
import shellApiRequestInjectable from "./proxy-functions/shell-api-request/shell-api-request.injectable";
import lensProxyPortInjectable from "./lens-proxy-port.injectable";
import contentSecurityPolicyInjectable from "../../common/vars/content-security-policy.injectable";
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import loggerInjectable from "../../common/logger.injectable";
import getClusterForRequestInjectable from "./get-cluster-for-request.injectable";
import { kubeApiUpgradeRequest } from "./proxy-functions/kube-api-upgrade-request";

const lensProxyInjectable = getInjectable({
  id: "lens-proxy",

  instantiate: (di) => new LensProxy({
    router: di.inject(routerInjectable),
    proxy: httpProxy.createProxy(),
    kubeApiUpgradeRequestHandler: kubeApiUpgradeRequest,
    shellApiRequestHandler: di.inject(shellApiRequestInjectable),
    getClusterForRequest: di.inject(getClusterForRequestInjectable),
    lensProxyPort: di.inject(lensProxyPortInjectable),
    contentSecurityPolicy: di.inject(contentSecurityPolicyInjectable),
    emitAppEvent: di.inject(emitAppEventInjectable),
    logger: di.inject(loggerInjectable),
  }),
});

export default lensProxyInjectable;
