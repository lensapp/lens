/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import createWriteFileStreamInjectable from "./create-write-file-stream.injectable";

export default getGlobalOverride(createWriteFileStreamInjectable, () => () => {
  throw new Error("tried to create a file write stream without override");
});
