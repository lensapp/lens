/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Agent } from "https";
import lensProxyCertificateInjectable from "../certificate/lens-proxy-certificate.injectable";

const lensAgentInjectable = getInjectable({
  id: "lens-agent",
  instantiate: (di) => {
    const lensProxyCert = di.inject(lensProxyCertificateInjectable);

    return new Agent({
      ca: lensProxyCert.get().cert,
    });
  },
});

export default lensAgentInjectable;
