/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { SetRequired } from "type-fest";
import type { RequestChannel } from "./request-channel-injection-token";

export type RequestFromChannelImpl<Channel> = Channel extends RequestChannel<infer Request, infer Response>
  ? Request extends void
    ? () => Promise<Response>
    : (req: Request) => Promise<Response>
  : never;

export type RequestFromChannel = <
  TChannel extends RequestChannel<any, any>,
>(
  channel: TChannel,
  ...request: TChannel["_requestSignature"] extends void
    ? []
    : [TChannel["_requestSignature"]]
) => Promise<SetRequired<TChannel, "_responseSignature">["_responseSignature"]>;

export const requestFromChannelInjectionToken =
  getInjectionToken<RequestFromChannel>({
    id: "request-from-request-channel",
  });
