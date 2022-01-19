/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Custom event emitter

interface Options {
  once?: boolean; // call once and remove
  prepend?: boolean; // put listener to the beginning
}

type Callback<D extends [...any[]]> = (...data: D) => void | boolean;

export class EventEmitter<D extends [...any[]]> {
  protected listeners: [Callback<D>, Options][] = [];

  addListener(callback: Callback<D>, options: Options = {}) {
    const fn = options.prepend ? "unshift" : "push";

    this.listeners[fn]([callback, options]);
  }

  removeListener(callback: Callback<D>) {
    this.listeners = this.listeners.filter(([cb]) => cb !== callback);
  }

  removeAllListeners() {
    this.listeners.length = 0;
  }

  emit = (...data: D) => {
    for (const [callback, { once }] of this.listeners) {
      if (once) {
        this.removeListener(callback);
      }

      if (callback(...data) === false) {
        break;
      }
    }
  };
}
