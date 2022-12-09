/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { evenBeforeFrameStartsInjectionToken } from "../before-frame-starts/tokens";
import requestLensProxyCertificateInjectable from "./request.injectable";
import lensProxyCertificateStateInjectable from "./state.injectable";

const initLensProxyCertificateStateInjectable = getInjectable({
  id: "init-lens-proxy-certificate-state",
  instantiate: (di) => ({
    id: "init-lens-proxy-certificate-state",
    run: async () => {
      const lensProxyCertificateState = di.inject(lensProxyCertificateStateInjectable);
      const requestLensProxyCertificate = di.inject(requestLensProxyCertificateInjectable);

      lensProxyCertificateState.set(await requestLensProxyCertificate());
    },
  }),
  injectionToken: evenBeforeFrameStartsInjectionToken,
});

export default initLensProxyCertificateStateInjectable;
