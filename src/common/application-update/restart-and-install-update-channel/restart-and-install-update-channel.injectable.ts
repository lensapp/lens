/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannel } from "../../utils/channel/message-channel-injection-token";
import { messageChannelInjectionToken } from "../../utils/channel/message-channel-injection-token";

export type RestartAndInstallUpdateChannel = MessageChannel;

const restartAndInstallUpdateChannel = getInjectable({
  id: "restart-and-install-update-channel",

  instantiate: (): RestartAndInstallUpdateChannel => ({
    id: "restart-and-install-update-channel",
  }),

  injectionToken: messageChannelInjectionToken,
});

export default restartAndInstallUpdateChannel;
