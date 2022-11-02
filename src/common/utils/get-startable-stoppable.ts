/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type Stopper = () => Promise<void> | void;
export type Starter = () => Promise<Stopper> | Stopper;

export type SyncStopper = () => void;
export type SyncStarter = () => SyncStopper;

export interface SyncStartableStoppable {
  readonly started: boolean;
  start: () => void;
  stop: () => void;
}

export interface StartableStoppable {
  readonly started: boolean;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

type StartableStoppableState = "stopped" | "started" | "starting";

export function getSyncStartableStoppable(id: string, syncStartAndGetSyncStopper: SyncStarter): SyncStartableStoppable {
  let stop: Stopper;
  let state: StartableStoppableState = "stopped";

  return {
    get started() {
      return state === "started";
    },

    start: (): void | Promise<void> => {
      if (state !== "stopped") {
        throw new Error(`Tried to start "${id}", but it is already ${state}.`);
      }

      state = "starting";
      stop = syncStartAndGetSyncStopper();
      state = "started";
    },

    stop: (): void | Promise<void> => {
      if (state !== "started") {
        throw new Error(`Tried to stop "${id}", but it is already ${state}.`);
      }

      stop();
      state = "stopped";
    },
  };
}

export function getStartableStoppable(id: string, startAndGetStopCallback: Starter): StartableStoppable {
  let stop: Stopper;
  let state: StartableStoppableState = "stopped";
  let startingPromise: Promise<Stopper> | Stopper;

  return {
    get started() {
      return state === "started";
    },

    start: async () => {
      if (state !== "stopped") {
        throw new Error(`Tried to start "${id}", but it is already ${state}.`);
      }

      state = "starting";
      startingPromise = startAndGetStopCallback();
      stop = await startingPromise;
      state = "started";
    },

    stop: async () => {
      if (state === "stopped") {
        throw new Error(`Tried to stop "${id}", but it is already ${state}.`);
      }

      await startingPromise;
      await stop();
      state = "stopped";
    },
  };
}
