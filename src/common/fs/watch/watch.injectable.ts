/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { FSWatcher, WatchOptions } from "chokidar";
import { watch } from "chokidar";

export type Watch = (path: string, options?: WatchOptions) => FSWatcher;

// TODO: Introduce wrapper to allow simpler API
const watchInjectable = getInjectable({
  id: "watch",
  instantiate: (): Watch => watch,
  causesSideEffects: true,
});

export default watchInjectable;
