/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export function addEventListener<K extends keyof HTMLElementEventMap>(target: HTMLElement, type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
  target.addEventListener(type, listener, options);

  return () => target.removeEventListener(type, listener, options);
}

export function addWindowEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
  window.addEventListener(type, listener, options);

  return () => window.removeEventListener(type, listener, options);
}
