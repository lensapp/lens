/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../common/test-utils/get-global-override";
import spawnKubeAuthProxyInjectable from "./spawn-proxy.injectable";

export default getGlobalOverride(spawnKubeAuthProxyInjectable, () => async (cluster) => ({
  apiPrefix: `/some-api-prefix-for-${cluster.id}`,
  port: 4233,
  stop: () => {},
}));
