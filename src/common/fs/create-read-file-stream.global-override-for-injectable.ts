/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import createReadFileStreamInjectable from "./create-read-file-stream.injectable";

export default getGlobalOverride(createReadFileStreamInjectable, () => () => {
  throw new Error("tried to create read stream for a file without override");
});
