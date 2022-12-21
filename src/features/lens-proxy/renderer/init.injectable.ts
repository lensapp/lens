/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsFirstInjectionToken } from "../../../renderer/before-frame-starts/tokens";
import requestFromChannelInjectable from "../../../renderer/utils/channel/request-from-channel.injectable";
import { lensProxyPortChannel } from "../common/port-channel";
import lensProxyPortInjectable from "../common/port.injectable";

const initLensProxyPortInjectable = getInjectable({
  id: "init-lens-proxy-port",
  instantiate: (di) => ({
    id: "init-lens-proxy-port",
    run: async () => {
      const lensProxyPort = di.inject(lensProxyPortInjectable);
      const requestFromChannel = di.inject(requestFromChannelInjectable);

      lensProxyPort.set(await requestFromChannel(lensProxyPortChannel));
    },
  }),
  injectionToken: beforeFrameStartsFirstInjectionToken,
});

export default initLensProxyPortInjectable;
