/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type EnsureDirectory = (dirPath: string) => Promise<void>;

const ensureDirectoryInjectable = getInjectable({
  id: "ensure-dir",
  instantiate: (di): EnsureDirectory => di.inject(fsInjectable).ensureDir,
});

export default ensureDirectoryInjectable;
