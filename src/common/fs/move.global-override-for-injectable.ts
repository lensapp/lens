/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import moveInjectable from "./move.injectable";

export default getGlobalOverride(moveInjectable, () => async () => {
  throw new Error("tried to move without override");
});
