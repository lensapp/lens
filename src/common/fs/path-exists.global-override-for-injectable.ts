/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import pathExistsInjectable from "./path-exists.injectable";

export default getGlobalOverride(pathExistsInjectable, () => async () => {
  throw new Error("Tried to check if a path exists without override");
});
