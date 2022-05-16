/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { randomBytes } from "crypto";
import { promisify } from "util";

const randomBytesInjectable = getInjectable({
  id: "random-bytes",
  instantiate: () => promisify(randomBytes),
  causesSideEffects: true,
});

export default randomBytesInjectable;
