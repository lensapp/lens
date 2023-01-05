/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ClusterId } from "../../../../common/cluster-types";
import type { RequestChannel } from "../../../../common/utils/channel/request-channel-listener-injection-token";

export type ClearClusterAsDeletingChannel = RequestChannel<ClusterId, void>;

export const clearClusterAsDeletingChannel: ClearClusterAsDeletingChannel = {
  id: "clear-cluster-as-deleting",
};
