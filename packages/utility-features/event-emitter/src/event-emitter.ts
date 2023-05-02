export interface EventEmitterOptions {
  once?: boolean; // call once and remove
  prepend?: boolean; // put listener to the beginning
}

export type EventEmitterCallback<D extends any[]> = (...data: D) => void | boolean;

export class EventEmitter<D extends any[]> {
  protected listeners: [EventEmitterCallback<D>, EventEmitterOptions][] = [];

  addListener(callback: EventEmitterCallback<D>, options: EventEmitterOptions = {}) {
    const fn = options.prepend ? "unshift" : "push";

    this.listeners[fn]([callback, options]);
  }

  removeListener(callback: EventEmitterCallback<D>) {
    this.listeners = this.listeners.filter(([cb]) => cb !== callback);
  }

  removeAllListeners() {
    this.listeners.length = 0;
  }

  emit(...data: D) {
    for (const [callback, { once }] of this.listeners) {
      if (once) {
        this.removeListener(callback);
      }

      if (callback(...data) === false) {
        break;
      }
    }
  }
}
