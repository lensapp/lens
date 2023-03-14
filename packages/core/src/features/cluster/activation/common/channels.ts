/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../../../../common/cluster-types";
import { getRequestChannel } from "@k8slens/messaging";

export interface ActivateCluster {
  clusterId: ClusterId;

  /**
   * @default false
   */
  force?: boolean;
}

export const activateClusterChannel = getRequestChannel<ActivateCluster, void>("activate-cluster");

export const deactivateClusterChannel = getRequestChannel<ClusterId, void>("deactivate-cluster");
