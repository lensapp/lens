export interface Listener<T> {
  (event: T): void;
}

export interface Disposable {
  dispose(): void;
}

export class EventBus<T> {
  private listeners: Listener<T>[] = [];
  private listenersOnce: Listener<T>[] = [];

  on(listener: Listener<T>): Disposable {
    this.listeners.push(listener);
    return {
      dispose: () => this.off(listener)
    };
  }

  once(listener: Listener<T>): void {
    this.listenersOnce.push(listener);
  }

  off(listener: Listener<T>) {
    const callbackIndex = this.listeners.indexOf(listener);
    if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
  }

  emit(event: T) {
    this.listeners.forEach((listener) => listener(event));

    // clear the once queue
    if (this.listenersOnce.length > 0) {
      const toCall = this.listenersOnce;
      this.listenersOnce = [];
      toCall.forEach((listener) => listener(event));
    }
  }

  pipe = (te: EventBus<T>): Disposable => {
    return this.on((e) => te.emit(e));
  }
}

export type AppEvent = {
  name: string;
  action: string;
  params?: object;
}

export const appEventBus = new EventBus<AppEvent>()
