/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export const getStartableStoppable = (
  id: string,
  startAndGetStopCallback: () => () => void,
) => {
  let dispose: () => void;
  let stopped = false;
  let started = false;

  return {
    start: () => {
      if (started) {
        throw new Error(`Tried to start "${id}", but it has already started.`);
      }

      stopped = false;

      dispose = startAndGetStopCallback();

      started = true;
    },

    stop: () => {
      if (stopped) {
        throw new Error(`Tried to stop "${id}", but it has already stopped.`);
      }

      if (!started) {
        throw new Error(`Tried to stop "${id}", but it has not started yet.`);
      }

      started = false;

      dispose();

      stopped = true;
    },
  };
};
