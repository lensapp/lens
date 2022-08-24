/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import deleteFileInjectable from "./delete-file.injectable";

export default getGlobalOverride(deleteFileInjectable, () => async () => {
  throw new Error("tried to delete file without override");
});
