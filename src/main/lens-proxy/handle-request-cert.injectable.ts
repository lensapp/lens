/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { lensProxyCertificateChannel } from "../../common/certificate/channel";
import { getRequestChannelListenerInjectable } from "../utils/channel/channel-listeners/listener-tokens";
import lensProxyCertificateInjectable from "./certificate.injectable";

const lensProxyCertificateHandlerInjectable = getRequestChannelListenerInjectable({
  channel: lensProxyCertificateChannel,
  handler: (di) => {
    const cert = di.inject(lensProxyCertificateInjectable);

    return () => cert;
  },
});

export default lensProxyCertificateHandlerInjectable;
