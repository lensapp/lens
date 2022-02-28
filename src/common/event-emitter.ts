/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * The options for when adding a new listener
 */
export interface AddListenerOptions {
  /**
   * Should the listener only ever receive one event.
   *
   * @default false
   */
  once?: boolean;

  /**
   * If `true` then the listener will be put to the front of the event queue
   *
   * @default false
   */
  prepend?: boolean;
}

/**
 * A function for handling events. If the function returns `false` then no
 * further listeners will be called for that event.
 */
export type EventListener<D extends any[]> = (...data: D) => void | boolean;

/**
 * An event emitter for a single event. Generic over the arguments for the
 * event handler.
 */
export class EventEmitter<D extends any[]> {
  protected listeners = new Map<EventListener<D>, Required<Omit<AddListenerOptions, "prepend">>>();

  /**
   * Add a new listener for this event emitter
   * @param callback The function to call when an event is emitted.
   * @param options Options for controlling how the listener is handled.
   */
  addListener(callback: EventListener<D>, options?: AddListenerOptions) {
    const { prepend, once = false } = options ?? {};

    if (prepend) {
      this.listeners = new Map([
        [callback, { once }],
        ...this.listeners.entries(),
      ]);
    } else {
      this.listeners.set(callback, { once });
    }
  }

  /**
   * Removes `callback` from being called for future events.
   * @param callback The listener instance to remove
   */
  removeListener(callback: EventListener<D>) {
    this.listeners.delete(callback);
  }

  /**
   * Removes all current listeners.
   */
  removeAllListeners() {
    this.listeners.clear();
  }

  /**
   * Emits a new event.
   * @param data The event data
   */
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
