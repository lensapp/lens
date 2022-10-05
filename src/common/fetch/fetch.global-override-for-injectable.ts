/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import fetchInjectable from "./fetch.injectable";

export default getGlobalOverride(fetchInjectable, () => () => {
  throw new Error("tried to fetch a resource without override in test");
});
