/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import randomUUIDInjectable from "./random-uuid.injectable";

export default getGlobalOverride(randomUUIDInjectable, () => () => {
  throw new Error("Tried to get a randomUUID without override");
});
