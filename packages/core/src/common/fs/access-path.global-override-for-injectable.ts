/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import accessPathInjectable from "./access-path.injectable";

export default getGlobalOverride(accessPathInjectable, () => async () => {
  throw new Error("tried to verify path access without override");
});
