/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Runnable } from "./run-many-for";
import type { RunnableSync } from "./run-many-sync-for";

export const throwWithIncorrectHierarchyFor =
  (allRunnables: Runnable<any>[] | RunnableSync<any>[]) =>
    (runnable: Runnable<any> | RunnableSync<any>) => {
      if (runnable.runAfter && !allRunnables.includes(runnable.runAfter)) {
        throw new Error(
          "Tried to run runnable after other runnable which does not same injection token.",
        );
      }
    };
