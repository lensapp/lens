/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../common/test-utils/get-global-override";
import fetchImplInjectable from "./fetch-impl.injectable";

export default getGlobalOverride(fetchImplInjectable, async () => ({
  default: async () => {
    throw new Error("tried to fetch resource without override");
  },
} as any));
