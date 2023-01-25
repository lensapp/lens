/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MessageChannel } from "../../../../common/utils/channel/message-channel-listener-injection-token";

export type ReloadPageChannel = MessageChannel<void>;

export const reloadPageChannel: ReloadPageChannel = {
  id: "reload-page-channel",
};
