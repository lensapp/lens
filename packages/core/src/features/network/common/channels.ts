/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MessageChannel } from "../../../common/utils/channel/message-channel-listener-injection-token";

export const networkGoneOnlineChannel: MessageChannel<void> = {
  id: "network-gone-online",
};

export const networkGoneOfflineChannel: MessageChannel<void> = {
  id: "network-gone-offline",
};
