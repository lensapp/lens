/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { resolveProxyInjectionToken } from "../common/resolve-proxy-injection-token";
import resolveProxyFromElectronInjectable from "./resolve-proxy-from-electron.injectable";

const resolveProxyInjectable = getInjectable({
  id: "resolve-proxy-for-main",

  instantiate: (di) => {
    const resolveProxyFromElectron = di.inject(resolveProxyFromElectronInjectable);

    return (url) => resolveProxyFromElectron(url);
  },

  injectionToken: resolveProxyInjectionToken,
});

export default resolveProxyInjectable;
