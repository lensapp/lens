/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { resolveSystemProxyInjectionToken } from "../../../common/utils/resolve-system-proxy/resolve-system-proxy-injection-token";
import resolveSystemProxyFromElectronInjectable from "./resolve-system-proxy-from-electron.injectable";

const resolveSystemProxyInjectable = getInjectable({
  id: "resolve-system-proxy-for-main",

  instantiate: (di) => {
    const resolveSystemProxyFromElectron = di.inject(resolveSystemProxyFromElectronInjectable);

    return (url) => resolveSystemProxyFromElectron(url);
  },

  injectionToken: resolveSystemProxyInjectionToken,
});

export default resolveSystemProxyInjectable;
