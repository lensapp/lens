/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { JsonValue } from "type-fest";

export interface RequestChannel<
  Request extends JsonValue | void = void,
  Response extends JsonValue | void = void,
> {
  id: string;
  _requestSignature?: Request;
  _responseSignature?: Response;
}

export const requestChannelInjectionToken = getInjectionToken<RequestChannel<any, any>>({
  id: "request-channel",
});
