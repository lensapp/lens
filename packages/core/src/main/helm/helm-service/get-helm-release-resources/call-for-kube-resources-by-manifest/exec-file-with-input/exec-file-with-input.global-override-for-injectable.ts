/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "@k8slens/test-utils";
import execFileWithInputInjectable from "./exec-file-with-input.injectable";

export default getGlobalOverride(execFileWithInputInjectable, () => () => {
  throw new Error(
    "Tried to call exec file with input without explicit override",
  );
});
