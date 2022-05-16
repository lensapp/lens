/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";

export interface Channel<TInstance> {
  id: string;
  _template?: TInstance;
}

export const channelInjectionToken = getInjectionToken<Channel<unknown>>({
  id: "channel",
});
