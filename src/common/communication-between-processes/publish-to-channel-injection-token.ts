/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Channel } from "../ipc-channel/channel";

export type PublishToChannel = <TChannel extends Channel<TMessage>, TMessage>(
  channel: TChannel,
  message: TChannel["_template"]
) => void;

export const publishToChannelInjectionToken =
  getInjectionToken<PublishToChannel>({
    id: "publish-to-channel",
  });
