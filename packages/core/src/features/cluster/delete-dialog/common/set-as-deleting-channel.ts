/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ClusterId } from "../../../../common/cluster-types";
import { getRequestChannel } from "@k8slens/messaging";

export const setClusterAsDeletingChannel = getRequestChannel<ClusterId, void>(
  "set-cluster-as-deleting",
);
