/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../cluster-types";
import type { MessageChannel } from "@k8slens/messaging";

export const currentClusterMessageChannel: MessageChannel<ClusterId> = {
  id: "current-visible-cluster",
};
