/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Agent } from "https";
import lensProxyCertificateInjectable from "../../common/certificate/lens-proxy-certificate.injectable";

const websocketAgentInjectable = getInjectable({
  id: "websocket-agent",
  instantiate: (di) => {
    const lensProxyCertificate = di.inject(lensProxyCertificateInjectable);

    return new Agent({
      cert: lensProxyCertificate.get().cert,
    });
  },
});

export default websocketAgentInjectable;
