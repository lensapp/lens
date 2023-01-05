/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannelHandler } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import { sendMessageToChannelInjectionToken } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { systemThemeTypeUpdateChannel } from "../common/channels";

export type EmitSystemThemeTypeUpdate = MessageChannelHandler<typeof systemThemeTypeUpdateChannel>;

const emitSystemThemeTypeUpdateInjectable = getInjectable({
  id: "emit-system-theme-type-update",
  instantiate: (di): EmitSystemThemeTypeUpdate => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (type) => sendMessageToChannel(systemThemeTypeUpdateChannel, type);
  },
});

export default emitSystemThemeTypeUpdateInjectable;
