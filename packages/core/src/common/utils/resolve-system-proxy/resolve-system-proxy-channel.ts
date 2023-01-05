/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RequestChannel } from "../channel/request-channel-listener-injection-token";

export type ResolveSystemProxyChannel = RequestChannel<string, string>;

export const resolveSystemProxyChannel: ResolveSystemProxyChannel = {
  id: "resolve-system-proxy-channel",
};
