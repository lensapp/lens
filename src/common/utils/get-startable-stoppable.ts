/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

type Stopper = () => Promise<void> | void;
type Starter = () => Promise<Stopper> | Stopper;

export const getStartableStoppable = (
  id: string,
  startAndGetStopCallback: Starter,
) => {
  let stop: Stopper;
  let stopped = false;
  let started = false;
  let startingPromise: Promise<Stopper> | Stopper;

  return {
    get started() {
      return started;
    },

    start: async () => {
      if (started) {
        throw new Error(`Tried to start "${id}", but it has already started.`);
      }

      startingPromise = startAndGetStopCallback();
      stop = await startingPromise;

      stopped = false;
      started = true;
    },

    stop: async () => {
      await startingPromise;

      if (stopped) {
        throw new Error(`Tried to stop "${id}", but it has already stopped.`);
      }

      if (!started) {
        throw new Error(`Tried to stop "${id}", but it has not started yet.`);
      }

      await stop();

      started = false;
      stopped = true;
    },
  };
};
