/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { SetRequired } from "type-fest";
import type { RequestChannel } from "./request-channel-injection-token";

export interface RequestChannelListener<TChannel extends RequestChannel<any, any>> {
  channel: TChannel;

  handler: (
    request: SetRequired<TChannel, "_requestSignature">["_requestSignature"]
  ) =>
    | SetRequired<TChannel, "_responseSignature">["_responseSignature"]
    | Promise<
        SetRequired<TChannel, "_responseSignature">["_responseSignature"]
      >;
}

export const requestChannelListenerInjectionToken = getInjectionToken<RequestChannelListener<RequestChannel<any, any>>>(
  {
    id: "request-channel-listener",
  },
);
