/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { lensProxyCertificateChannel } from "../../common/certificate/lens-proxy-certificate-channel";
import requestFromChannelInjectable from "../utils/channel/request-from-channel.injectable";

const requestLensProxyCertificateInjectable = getInjectable({
  id: "request-lens-proxy-certificate",
  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectable);

    return () => requestFromChannel(lensProxyCertificateChannel);
  },
});

export default requestLensProxyCertificateInjectable;
