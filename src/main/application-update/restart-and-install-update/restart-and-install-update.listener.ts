/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import restartAndInstallUpdateChannel from "../../../common/application-update/restart-and-install-update-channel/restart-and-install-update-channel.injectable";
import { messageChannelListenerInjectionToken } from "../../../common/utils/channel/message-channel-listener-injection-token";
import quitAndInstallUpdateInjectable from "../quit-and-install-update.injectable";

const restartAndInstallUpdateListenerInjectable = getInjectable({
  id: "restart-and-install-update-listener",

  instantiate: (di) => {
    const quitAndInstall = di.inject(quitAndInstallUpdateInjectable);
    const channel = di.inject(restartAndInstallUpdateChannel);

    return {
      channel,
      handler: quitAndInstall,
    };
  },

  injectionToken: messageChannelListenerInjectionToken,
});

export default restartAndInstallUpdateListenerInjectable;
