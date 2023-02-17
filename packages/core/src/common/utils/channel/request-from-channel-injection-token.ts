/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { RequestChannel } from "./request-channel-listener-injection-token";

export interface RequestFromChannel {
  <Request, Response>(channel: RequestChannel<Request, Response>, request: Request): Promise<Response>;
  <Response>(channel: RequestChannel<void, Response>): Promise<Response>;
}

export type ChannelRequester<Channel> = Channel extends RequestChannel<infer Req, infer Res>
  ? (req: Req) => Promise<Res>
  : never;

export const requestFromChannelInjectionToken = getInjectionToken<RequestFromChannel>({
  id: "request-from-request-channel",
});
