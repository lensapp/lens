/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";

export type GetBasenameOfPath = (path: string) => string;

const getBasenameOfPathInjectable = getInjectable({
  id: "get-basename-of-path",
  instantiate: (): GetBasenameOfPath => (...values) => path.basename(...values),
  causesSideEffects: true,
});

export default getBasenameOfPathInjectable;
