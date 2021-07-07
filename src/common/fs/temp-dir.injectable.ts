/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import tempy from "tempy";

export interface TempDirOptions {
  prefix?: string;
}

export type TempDir = (opts?: TempDirOptions) => string;

const tempDirInjectable = getInjectable({
  id: "temp-dir",
  instantiate: (): TempDir => opts => tempy.directory(opts),
});

export default tempDirInjectable;
