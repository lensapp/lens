/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";

export type GetDirnameOfPath = (path: string) => string;

const getDirnameOfPathInjectable = getInjectable({
  id: "get-dirname-of-path",
  instantiate: (): GetDirnameOfPath => path.dirname,
  causesSideEffects: true,
});

export default getDirnameOfPathInjectable;
