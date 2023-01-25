/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "../../test-utils/get-global-override";
import watchInjectable from "./watch.injectable";

export default getGlobalOverride(watchInjectable, () => () => {
  throw new Error("Tried to call file system watch without explicit override");
});
