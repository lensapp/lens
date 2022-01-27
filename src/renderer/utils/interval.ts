/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Helper for working with time updates / data-polling callbacks

export interface IntervalFn {
  start(runImmediately?: boolean): void;
  stop(): void;
  restart(runImmediately?: boolean): void;
  readonly isRunning: boolean;
}

export function interval(timeSec = 1, callback: (count: number) => void, autoRun = false): IntervalFn {
  let count = 0;
  let timer = -1;
  let isRunning = false;
  const intervalManager = {
    start(runImmediately = false) {
      if (isRunning) return;
      const tick = () => callback(++count);

      isRunning = true;
      timer = window.setInterval(tick, 1000 * timeSec);
      if (runImmediately) tick();
    },
    stop() {
      count = 0;
      isRunning = false;
      clearInterval(timer);
    },
    restart(runImmediately = false) {
      this.stop();
      this.start(runImmediately);
    },
    get isRunning() {
      return isRunning;
    },
  };

  if (autoRun) intervalManager.start();

  return intervalManager;
}
