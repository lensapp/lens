/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Disposer } from "../disposer";
import type { RequestChannel, RequestChannelListener } from "./request-channel-listener-injection-token";

export type EnlistRequestChannelListener = <TChannel extends RequestChannel<unknown, unknown>>(listener: RequestChannelListener<TChannel>) => Disposer;

export const enlistRequestChannelListenerInjectionToken = getInjectionToken<EnlistRequestChannelListener>({
  id: "enlist-request-channel-listener",
});
