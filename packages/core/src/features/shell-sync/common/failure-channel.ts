/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MessageChannel } from "@k8slens/messaging";

export const shellSyncFailedChannel: MessageChannel<string> = {
  id: "shell-sync-failed-channel",
};
