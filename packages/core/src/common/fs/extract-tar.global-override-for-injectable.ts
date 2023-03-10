/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import extractTarInjectable from "./extract-tar.injectable";

export default getGlobalOverride(extractTarInjectable, () => async () => {
  throw new Error("tried to extract a tar file without override");
});
