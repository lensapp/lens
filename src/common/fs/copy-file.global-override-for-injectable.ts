/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import copyFileInjectable from "./copy-file.injectable";

export default getGlobalOverride(copyFileInjectable, () => () => {
  throw new Error("tried to copy a file without override");
});
