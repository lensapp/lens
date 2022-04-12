/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export const getStartableStoppable = (
  startAndGetStopCallback: () => () => void,
) => {
  let dispose: () => void;
  let stopped = false;
  let started = false;

  return {
    start: () => {
      if (started) {
        throw new Error("Tried to start something that has already started.");
      }

      stopped = false;

      dispose = startAndGetStopCallback();

      started = true;
    },

    stop: () => {
      if (stopped) {
        throw new Error("Tried to stop something that has already stopped.");
      }

      if (!started) {
        throw new Error("Tried to stop something that has not started yet.");
      }

      started = false;

      dispose();

      stopped = true;
    },
  };
};
