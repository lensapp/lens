/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ClusterId } from "../../../../common/cluster-types";
import { getRequestChannel, RequestChannel } from "@k8slens/messaging";

export type DeleteClusterChannel = RequestChannel<ClusterId, void>;

export const deleteClusterChannel = getRequestChannel<ClusterId, void>(
  "delete-cluster"
);
