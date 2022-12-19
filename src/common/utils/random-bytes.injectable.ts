/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { randomBytes } from "crypto";
import { promisify } from "util";

export type RandomBytes = (size: number) => Promise<Buffer>;

const randomBytesInjectable = getInjectable({
  id: "random-bytes",
  instantiate: (): RandomBytes => promisify(randomBytes),
  causesSideEffects: true,
});

export default randomBytesInjectable;
