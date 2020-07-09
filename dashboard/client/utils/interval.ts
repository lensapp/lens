// Helper for working with time updates / data-polling callbacks

type IntervalCallback = (count: number) => void;

export class IntervalManager {
  private count: number;
  private timer: number;
  private isCurRunning: boolean;
  private timeSec: number;
  private callback: IntervalCallback;

  constructor(timeSec = 1, callback: IntervalCallback, autoRun = false) {
    this.timeSec = timeSec;
    this.callback = callback;

    if (autoRun) {
      this.start();
    }
  }
  
  start(runImmediately?: boolean): void {
    if (this.isRunning) {
      return;
    }

    const tick = (): void => this.callback(++this.count);
    this.isCurRunning = true;
    this.timer = window.setInterval(tick, 1000 * this.timeSec);
    
    if (runImmediately) {
      tick();
    }
  }

  stop(): void {
    this.count = 0;
    this.isCurRunning = false;
    clearInterval(this.timer);
  }

  restart(runImmediately = false): void {
    this.stop();
    this.start(runImmediately);
  }

  get isRunning(): boolean {
    return this.isCurRunning;
  }
}