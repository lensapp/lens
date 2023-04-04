/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type Stopper = () => void;
export type Starter = () => Stopper;

export interface StartableStoppable {
  readonly started: boolean;
  start: () => void;
  stop: () => void;
}

type StartableStoppableState = "stopped" | "started" | "starting";

export const startableStoppableMap = new Map();

export function getStartableStoppable(id: string, startAndGetStopper: Starter): StartableStoppable {
  let stop: Stopper;
  let state: StartableStoppableState = "stopped";

  startableStoppableMap.set(id, state);

  return {
    get started() {
      return state === "started";
    },

    start: () => {
      if (state !== "stopped") {
        throw new Error(`Tried to start "${id}", but it is already ${state}.`);
      }

      state = "starting";
      startableStoppableMap.set(id, state);
      stop = startAndGetStopper();
      state = "started";
      startableStoppableMap.set(id, state);
    },

    stop: () => {
      if (state !== "started") {
        throw new Error(`Tried to stop "${id}", but it is already ${state}.`);
      }

      stop();
      state = "stopped";
      startableStoppableMap.set(id, state);
    },
  };
}
