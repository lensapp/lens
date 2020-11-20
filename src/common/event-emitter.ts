// Custom event emitter

interface Options {
  once?: boolean; // call once and remove
  prepend?: boolean; // put listener to the beginning
}

type Callback<D extends [...any[]]> = (...data: D) => void | boolean;

export class EventEmitter<D extends [...any[]]> {
  protected listeners = new Map<Callback<D>, Options>();

  addListener(callback: Callback<D>, options: Options = {}) {
    if (options.prepend) {
      const listeners = [...this.listeners];
      listeners.unshift([callback, options]);
      this.listeners = new Map(listeners);
    }
    else {
      this.listeners.set(callback, options);
    }
  }

  removeListener(callback: Callback<D>) {
    this.listeners.delete(callback);
  }

  removeAllListeners() {
    this.listeners.clear();
  }

  emit(...data: D) {
    [...this.listeners].every(([callback, options]) => {
      if (options.once) this.removeListener(callback);
      const result = callback(...data);
      if (result === false) return; // break cycle
      return true;
    })
  }
}
