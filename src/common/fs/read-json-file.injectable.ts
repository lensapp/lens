/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { JsonValue } from "type-fest";
import fsInjectable from "./fs.injectable";

export type ReadJson = (filePath: string) => Promise<JsonValue>;

const readJsonFileInjectable = getInjectable({
  id: "read-json-file",
  instantiate: (di): ReadJson => di.inject(fsInjectable).readJson,
});

export default readJsonFileInjectable;
