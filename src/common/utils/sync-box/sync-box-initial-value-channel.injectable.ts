/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestChannel } from "../channel/request-channel-injection-token";
import { requestChannelInjectionToken } from "../channel/request-channel-injection-token";

export type SyncBoxInitialValueChannel = RequestChannel<
  void,
  { id: string; value: any }[]
>;

const syncBoxInitialValueChannelInjectable = getInjectable({
  id: "sync-box-initial-value-channel",

  instantiate: (): SyncBoxInitialValueChannel => ({
    id: "sync-box-initial-value-channel",
  }),

  injectionToken: requestChannelInjectionToken,
});

export default syncBoxInitialValueChannelInjectable;
