/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../../common/test-utils/get-global-override";
import computeUnixShellEnvironmentInjectable from "./compute-unix-shell-environment.injectable";

export default getGlobalOverride(computeUnixShellEnvironmentInjectable, () => async () => {
  throw new Error("Tried to get unix shell env without override");
});
