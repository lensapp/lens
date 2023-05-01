/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ParsedPath } from "path";
import path from "path";

export type ParsePath = (path: string) => ParsedPath;

const parsePathInjectable = getInjectable({
  id: "parse-path",
  instantiate: (): ParsePath => (...values) => path.parse(...values),
  causesSideEffects: true,
});

export default parsePathInjectable;
