/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import readDirInjectable from "./read-dir.injectable";

export default getGlobalOverride(readDirInjectable, () => async () => {
  throw new Error("tried to read a directory's content without override");
});
