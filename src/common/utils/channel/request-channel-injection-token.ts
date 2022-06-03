/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { IpcValue } from "./allowed-types";

export interface RequestChannel<
  Request extends IpcValue | void = void,
  Response extends IpcValue | void = void,
> {
  id: Request | Response extends boolean ? string : string;
}

export type ChannelRequest<Channel> = Channel extends RequestChannel<infer Request, infer Response>
  ? (arg: Request) => Promise<Response>
  : never;

export const requestChannelInjectionToken = getInjectionToken<RequestChannel<any, any>>({
  id: "request-channel",
});
