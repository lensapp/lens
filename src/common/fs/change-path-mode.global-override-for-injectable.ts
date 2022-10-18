/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import changePathModeInjectable from "./change-path-mode.injectable";

export default getGlobalOverride(changePathModeInjectable, () => () => {
  throw new Error("tried to change path mode without override");
});
