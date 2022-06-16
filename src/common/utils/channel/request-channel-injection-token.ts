/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export interface RequestChannel<
  Request = void,
  Response = void,
> {
  id: string;
  _requestSignature?: Request;
  _responseSignature?: Response;
}

export const requestChannelInjectionToken = getInjectionToken<RequestChannel<any, any>>({
  id: "request-channel",
});
