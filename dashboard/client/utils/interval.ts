// Helper for working with time updates / data-polling callbacks

type IntervalCallback = (count: number) => void;

export function interval(timeSec = 1, callback: IntervalCallback, autoRun = false) {
  let count = 0;
  let timer = -1;
  let isRunning = false;
  const intervalManager = {
    start: function (runImmediately = false) {
      if (isRunning) return;
      const tick = () => callback(++count);
      isRunning = true;
      timer = window.setInterval(tick, 1000 * timeSec);
      if (runImmediately) tick();
    },
    stop: function () {
      count = 0;
      isRunning = false;
      clearInterval(timer);
    },
    restart: function (runImmediately = false) {
      this.stop();
      this.start(runImmediately);
    },
    get isRunning() {
      return isRunning;
    }
  }
  if (autoRun) intervalManager.start();
  return intervalManager;
}
