/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Helper for working with time updates / data-polling callbacks

type IntervalCallback = (count: number) => void;

export function interval(timeSec = 1, callback: IntervalCallback, autoRun = false) {
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
