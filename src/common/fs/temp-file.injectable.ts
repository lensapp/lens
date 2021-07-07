/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import tempy from "tempy";
import { getInjectable } from "@ogre-tools/injectable";
import type { MergeExclusive } from "type-fest";

export type TempFileOptions = MergeExclusive<{
  name?: string;
}, {
  extension?: string;
}>;

export type TempFile = (opts?: TempFileOptions) => string;

const tempFileInjectable = getInjectable({
  id: "temp-file",
  instantiate: (): TempFile => (opts) => tempy.file(opts),
});

export default tempFileInjectable;

