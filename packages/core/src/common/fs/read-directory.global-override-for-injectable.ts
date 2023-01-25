/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import readDirectoryInjectable from "./read-directory.injectable";

export default getGlobalOverride(readDirectoryInjectable, () => async () => {
  throw new Error("tried to read a directory's content without override");
});
