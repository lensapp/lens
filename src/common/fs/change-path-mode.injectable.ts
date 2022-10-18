/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type ChangePathMode = (path: string, newMode: number) => Promise<void>;

const changePathModeInjectable = getInjectable({
  id: "change-path-mode",
  instantiate: (di): ChangePathMode => di.inject(fsInjectable).chmod,
});

export default changePathModeInjectable;
