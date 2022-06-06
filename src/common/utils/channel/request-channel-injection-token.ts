/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { IpcValue } from "./allowed-types";

/**
 * Both of these type parameters are technically unused. Which is fine because we only really
 * care about them at type check time since they are here to guide what types other functions
 * require (which in turn are just passed on).
 */
export interface RequestChannel<
  // eslint-disable-next-line unused-imports/no-unused-vars-ts
  Request extends IpcValue | void = void,
  // eslint-disable-next-line unused-imports/no-unused-vars-ts
  Response extends IpcValue | void = void,
> {
  id: string;
}

export type ChannelRequest<Channel> = Channel extends RequestChannel<infer Request, infer Response>
  ? (arg: Request) => Promise<Response>
  : never;

export const requestChannelInjectionToken = getInjectionToken<RequestChannel<any, any>>({
  id: "request-channel",
});
