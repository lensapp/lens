/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";

export interface Channel {
  id: string;
}

export const channelInjectionToken = getInjectionToken<Channel>({
  id: "channel",
});
