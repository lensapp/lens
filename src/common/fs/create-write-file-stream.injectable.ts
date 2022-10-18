/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { createWriteStream } from "fs";
import fsInjectable from "./fs.injectable";

export type CreateWriteFileStream = typeof createWriteStream;

const createWriteFileStreamInjectable = getInjectable({
  id: "create-write-file-stream",
  instantiate: (di) => di.inject(fsInjectable).createWriteStream,
});

export default createWriteFileStreamInjectable;
