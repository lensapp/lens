/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../common/test-utils/get-global-override";
import catalogSyncToRendererInjectable from "./catalog-sync-to-renderer.injectable";

// TODO: remove this so that we can actually behaviourally test this IPC
export default getGlobalOverride(catalogSyncToRendererInjectable, () => ({
  start: () => {},
  stop: () => {},
  started: false,
}));
