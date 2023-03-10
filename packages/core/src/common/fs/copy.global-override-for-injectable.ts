/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import copyInjectable from "./copy.injectable";

export default getGlobalOverride(copyInjectable, () => async () => {
  throw new Error("tried to copy filepaths without override");
});
