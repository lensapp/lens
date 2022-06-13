/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { LensProxy } from "./lens-proxy";
import routerInjectable from "../router/router.injectable";
import shellApiRequestInjectable from "./proxy-functions/shell/api-request.injectable";
import lensProxyPortInjectable from "./lens-proxy-port.injectable";
import getClusterForRequestInjectable from "./get-cluster-for-request.injectable";
import kubeApiUpgradeRequestInjectable from "./proxy-functions/kube/api-upgrade-request.injectable";
import lensProxyServerInjectable from "./proxy-server.injectable";

const lensProxyInjectable = getInjectable({
  id: "lens-proxy",

  instantiate: (di) => new LensProxy({
    router: di.inject(routerInjectable),
    proxy: di.inject(lensProxyServerInjectable),
    kubeApiUpgradeRequest: di.inject(kubeApiUpgradeRequestInjectable),
    shellApiRequest: di.inject(shellApiRequestInjectable),
    getClusterForRequest: di.inject(getClusterForRequestInjectable),
    lensProxyPort: di.inject(lensProxyPortInjectable),
  }),
});

export default lensProxyInjectable;
