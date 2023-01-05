/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import ensureDirInjectable from "./ensure-dir.injectable";

export default getGlobalOverride(ensureDirInjectable, () => async () => {
  throw new Error("tried to ensure directory without override");
});
