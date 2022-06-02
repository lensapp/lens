/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { RequestChannel } from "./request-channel-injection-token";
import type { RequestChannelListener } from "./request-channel-listener-injection-token";

export type EnlistRequestChannelListener = <
  TChannel extends RequestChannel<any, any>,
>(listener: RequestChannelListener<TChannel>) => () => void;

export const enlistRequestChannelListenerInjectionToken =
  getInjectionToken<EnlistRequestChannelListener>({
    id: "enlist-request-channel-listener",
  });
