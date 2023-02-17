/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../../../../common/cluster-types";
import type { RequestChannel } from "../../../../common/utils/channel/request-channel-listener-injection-token";

export const setClusterFrameIdChannel: RequestChannel<ClusterId, void> = {
  id: "set-cluster-frame-id",
};
