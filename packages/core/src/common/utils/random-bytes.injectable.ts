/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { randomBytes } from "crypto";

export type RandomBytes = (size: number) => Buffer;

const randomBytesInjectable = getInjectable({
  id: "random-bytes",
  instantiate: (): RandomBytes => randomBytes,
  causesSideEffects: true,
});

export default randomBytesInjectable;
