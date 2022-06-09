/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { MessageChannel } from "./message-channel-injection-token";
import type { MessageChannelListener } from "./message-channel-listener-injection-token";

export type EnlistMessageChannelListener = <
  TChannel extends MessageChannel<any>,
>(listener: MessageChannelListener<TChannel>) => () => void;

export const enlistMessageChannelListenerInjectionToken =
  getInjectionToken<EnlistMessageChannelListener>({
    id: "enlist-message-channel-listener",
  });
