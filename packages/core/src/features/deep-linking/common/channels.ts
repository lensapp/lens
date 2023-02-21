/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteAttempt } from "../../../common/protocol-handler";
import type { MessageChannel } from "../../../common/utils/channel/message-channel-listener-injection-token";

export interface DeepLinkingRouteAttempt {
  url: string;
  previous: RouteAttempt;
  target: "internal" | "external";
}

export const deepLinkingRouteAttemptChannel: MessageChannel<DeepLinkingRouteAttempt> = {
  id: "deep-linking-route-attempt",
};

export interface InvalidDeepLinkingAttempt {
  error: string;
  url: string;
}

export const invalidDeepLinkingAttemptChannel: MessageChannel<InvalidDeepLinkingAttempt> = {
  id: "invalid-deep-linking-attempt",
};
