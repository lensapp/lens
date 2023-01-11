/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { LensProxy } from "./lens-proxy";
import { kubeApiUpgradeRequest } from "./proxy-functions";
import httpProxy from "http-proxy";
import shellApiRequestInjectable from "./proxy-functions/shell-api-request.injectable";
import lensProxyPortInjectable from "./lens-proxy-port.injectable";
import contentSecurityPolicyInjectable from "../../common/vars/content-security-policy.injectable";
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import loggerInjectable from "../../common/logger.injectable";
import lensProxyCertificateInjectable from "../../common/certificate/lens-proxy-certificate.injectable";
import getClusterForRequestInjectable from "./get-cluster-for-request.injectable";
import routeRequestInjectable from "../router/route-request.injectable";

const lensProxyInjectable = getInjectable({
  id: "lens-proxy",

  instantiate: (di) => new LensProxy({
    routeRequest: di.inject(routeRequestInjectable),
    proxy: httpProxy.createProxy(),
    kubeApiUpgradeRequest,
    shellApiRequest: di.inject(shellApiRequestInjectable),
    getClusterForRequest: di.inject(getClusterForRequestInjectable),
    lensProxyPort: di.inject(lensProxyPortInjectable),
    contentSecurityPolicy: di.inject(contentSecurityPolicyInjectable),
    emitAppEvent: di.inject(emitAppEventInjectable),
    logger: di.inject(loggerInjectable),
    certificate: di.inject(lensProxyCertificateInjectable).get(),
  }),
});

export default lensProxyInjectable;
