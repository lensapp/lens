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
