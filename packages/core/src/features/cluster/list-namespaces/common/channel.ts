/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../../../../common/cluster-types";
import type { MessageChannel } from "../../../../common/utils/channel/message-channel-listener-injection-token";

export const clusterFailedToListNamespacesChannel: MessageChannel<ClusterId> = {
  id: "cluster-failed-to-list-namespaces",
};
