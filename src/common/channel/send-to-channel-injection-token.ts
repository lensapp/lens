/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Channel } from "./channel-injection-token";

export type SendToChannel = <TChannel extends Channel<unknown, unknown>>(
  channel: TChannel,
  message?: TChannel["_messageTemplate"]
) => void;

export const sendToChannelInjectionToken =
  getInjectionToken<SendToChannel>({
    id: "send-to-channel",
  });
