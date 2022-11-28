/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CopyOptions } from "fs-extra";
import fsInjectable from "./fs.injectable";

export type Copy = (src: string, dest: string, options?: CopyOptions | undefined) => Promise<void>;

const copyInjectable = getInjectable({
  id: "copy",
  instantiate: (di): Copy => di.inject(fsInjectable).copy,
});

export default copyInjectable;
