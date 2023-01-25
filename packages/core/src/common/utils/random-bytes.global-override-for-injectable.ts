/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import randomBytesInjectable from "./random-bytes.injectable";

export default getGlobalOverride(randomBytesInjectable, () => async (size) => {
  const res = Buffer.alloc(size);

  for (let i = 0; i < size; i += 1) {
    res[i] = i;
  }

  return res;
});
