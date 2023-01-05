/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Stats } from "fs";
import fsInjectable from "./fs.injectable";

export type LStat = (path: string) => Promise<Stats>;

const lstatInjectable = getInjectable({
  id: "lstat",
  instantiate: (di): LStat => di.inject(fsInjectable).lstat,
});

export default lstatInjectable;
