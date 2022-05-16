/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Channel } from "./channel-injection-token";

export const sendToAgnosticChannelInjectionToken = getInjectionToken<(channel: Channel, message: any) => void>({
  id: "send-to-agnostic-channel",
});
