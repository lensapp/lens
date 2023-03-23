export type Stopper = () => void;
export type Starter = () => Stopper;

export interface StartableStoppable {
  readonly started: boolean;
  start: () => void;
  stop: () => void;
}

type StartableStoppableState = "stopped" | "started" | "starting";

export function getStartableStoppable(id: string, startAndGetStopper: Starter): StartableStoppable {
  let stop: Stopper;
  let state: StartableStoppableState = "stopped";

  return {
    get started() {
      return state === "started";
    },

    start: () => {
      if (state !== "stopped") {
        throw new Error(`Tried to start "${id}", but it is already ${state}.`);
      }

      state = "starting";
      stop = startAndGetStopper();
      state = "started";
    },

    stop: () => {
      if (state !== "started") {
        throw new Error(`Tried to stop "${id}", but it is already ${state}.`);
      }

      stop();
      state = "stopped";
    },
  };
}
