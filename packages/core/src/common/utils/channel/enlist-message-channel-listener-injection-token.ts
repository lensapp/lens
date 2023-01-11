/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Disposer } from "../disposer";
import type { MessageChannel, MessageChannelListener } from "./message-channel-listener-injection-token";

export type EnlistMessageChannelListener = (listener: MessageChannelListener<MessageChannel<unknown>>) => Disposer;

export const enlistMessageChannelListenerInjectionToken = getInjectionToken<EnlistMessageChannelListener>({
  id: "enlist-message-channel-listener",
});
