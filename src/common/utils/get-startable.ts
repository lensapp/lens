/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type Starter = (signal: AbortSignal) => Promise<void>;

export interface SingleStartable {
  start: () => Promise<void>;
  stop: () => void;
}

export function getSingleStartable(id: string, start: Starter): SingleStartable {
  const controller = new AbortController();

  return {
    start: async () => {
      await start(controller.signal);
    },
    stop: () => {
      controller.abort();
    },
  };
}
