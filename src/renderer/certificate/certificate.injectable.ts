/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { lensProxyCertificateInjectionToken } from "../../common/certificate/token";
import lensProxyCertificateStateInjectable from "./state.injectable";

const lensProxyCertificateInjectable = getInjectable({
  id: "lens-proxy-certificate",
  instantiate: (di) => di.inject(lensProxyCertificateStateInjectable).get(),
  injectionToken: lensProxyCertificateInjectionToken,
});

export default lensProxyCertificateInjectable;
