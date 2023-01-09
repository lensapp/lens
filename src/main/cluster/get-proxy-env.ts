/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../common/cluster/cluster";

export const getProxyEnv = (cluster: Cluster) => cluster.preferences.httpsProxy
  ? {
    HTTPS_PROXY: cluster.preferences.httpsProxy,
  }
  : {};
