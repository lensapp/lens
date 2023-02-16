/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { sendMessageToChannelInjectionToken } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { setExtensionInstallPhaseChannel } from "../common/channels";
import { setExtensionAsInstallingInjectionToken } from "../common/tokens";

const setExtensionAsInstallingInjectable = getInjectable({
  id: "set-extension-as-installing",
  instantiate: (di) => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (id) => sendMessageToChannel(setExtensionInstallPhaseChannel, {
      id,
      phase: "installing",
    });
  },
  injectionToken: setExtensionAsInstallingInjectionToken,
});

export default setExtensionAsInstallingInjectable;
