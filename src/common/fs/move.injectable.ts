/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MoveOptions } from "fs-extra";
import fsInjectable from "./fs.injectable";

export type Move = (src: string, dest: string, options?: MoveOptions) => Promise<void>;

const moveInjectable = getInjectable({
  id: "move",
  instantiate: (di): Move => di.inject(fsInjectable).move,
});

export default moveInjectable;
