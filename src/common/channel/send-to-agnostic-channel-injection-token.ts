/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Channel } from "./channel-injection-token";

export type SendToAgnosticChannel = <TChannel extends Channel<unknown>>(
  channel: TChannel,
  message: TChannel["_messageTemplate"]
) => void;

export const sendToAgnosticChannelInjectionToken =
  getInjectionToken<SendToAgnosticChannel>({
    id: "send-to-agnostic-channel",
  });
