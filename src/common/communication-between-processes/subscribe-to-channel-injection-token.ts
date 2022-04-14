/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Channel } from "../ipc-channel/channel";

export type SubscribeToChannel = <TChannel extends Channel<TMessage>, TMessage>(
  channel: TChannel,
  callback: (message: TChannel["_template"]) => void
) => void;

export const subscribeToChannelInjectionToken = getInjectionToken<SubscribeToChannel>({
  id: "subscribe-to-channel",
});
