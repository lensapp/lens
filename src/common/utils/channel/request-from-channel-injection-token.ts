/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { RequestChannel } from "./request-channel-injection-token";

export type RequestFromChannel = <
  Channel,
  Request = Channel extends RequestChannel<infer Request, any> ? Request : never,
  Response = Channel extends RequestChannel<any, infer Response> ? Response : never,
>(
  channel: Channel,
  ...request: Request extends void
    ? []
    : [Request]
) => Promise<Response>;

export const requestFromChannelInjectionToken = getInjectionToken<RequestFromChannel>({
  id: "request-from-request-channel",
});
