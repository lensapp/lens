/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import lstatInjectable from "./lstat.injectable";

export default getGlobalOverride(lstatInjectable, () => async () => {
  throw new Error("tried to lstat a filepath without override");
});
