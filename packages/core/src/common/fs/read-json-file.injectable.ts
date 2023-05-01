/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type ReadJson = (filePath: string) => Promise<unknown>;

const readJsonFileInjectable = getInjectable({
  id: "read-json-file",
  instantiate: (di): ReadJson => di.inject(fsInjectable).readJson,
});

export default readJsonFileInjectable;
