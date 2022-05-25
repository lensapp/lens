/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { RequestChannel } from "./request-channel-injection-token";

export interface RequestChannelListener<TChannel extends RequestChannel<any, any>> {
  channel: TChannel;
  handler: (request: TChannel["_requestSignature"]) => TChannel["_responseSignature"];
}

export const requestChannelListenerInjectionToken = getInjectionToken<RequestChannelListener<RequestChannel<any, any>>>(
  {
    id: "request-channel-listener",
  },
);
