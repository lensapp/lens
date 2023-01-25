/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { MessageChannel } from "../channel/message-channel-listener-injection-token";
import type { RequestChannel } from "../channel/request-channel-listener-injection-token";

export type SyncBoxChannel = MessageChannel<{ id: string; value: any }>;

export const syncBoxChannel: SyncBoxChannel = {
  id: "sync-box-channel",
};

export type SyncBoxInitialValueChannel = RequestChannel<
  void,
  { id: string; value: any }[]
>;

export const syncBoxInitialValueChannel: SyncBoxInitialValueChannel = {
  id: "sync-box-initial-value-channel",
};
