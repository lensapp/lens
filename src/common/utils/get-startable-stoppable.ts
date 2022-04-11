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
        throw new Error("Tried to restart something that has stopped.");
      }

      dispose = startAndGetStopCallback();

      started = true;
    },

    stop: () => {
      if (!started) {
        throw new Error("Tried to stop something that has not started yet.");
      }

      if (stopped) {
        throw new Error("Tried to stop something that has already stopped.");
      }

      dispose();

      stopped = true;
    },
  };
};
