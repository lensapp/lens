/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { EventEmitter } from "../event-emitter";

describe("EventEmitter", () => {
  it("should stop early if a listener returns false", () => {
    let called = false;
    const e = new EventEmitter<[]>();

    e.addListener(() => false, {});
    e.addListener(() => { called = true; }, {});
    e.emit();

    expect(called).toBe(false);
  });

  it("shouldn't stop early if a listener returns 0", () => {
    let called = false;
    const e = new EventEmitter<[]>();

    e.addListener(() => 0 as never, {});
    e.addListener(() => { called = true; }, {});
    e.emit();

    expect(called).toBe(true);
  });

  it("prepended listeners should be called before others", () => {
    const callOrder: number[] = [];
    const e = new EventEmitter<[]>();

    e.addListener(() => { callOrder.push(1); }, {});
    e.addListener(() => { callOrder.push(2); }, {});
    e.addListener(() => { callOrder.push(3); }, { prepend: true });
    e.emit();

    expect(callOrder).toStrictEqual([3, 1, 2]);
  });

  it("once listeners should be called only once", () => {
    const callOrder: number[] = [];
    const e = new EventEmitter<[]>();

    e.addListener(() => { callOrder.push(1); }, {});
    e.addListener(() => { callOrder.push(2); }, {});
    e.addListener(() => { callOrder.push(3); }, { once: true });
    e.emit();
    e.emit();

    expect(callOrder).toStrictEqual([1, 2, 3, 1, 2]);
  });

  it("removeListener should stop the listener from being called", () => {
    const callOrder: number[] = [];
    const e = new EventEmitter<[]>();
    const r = () => { callOrder.push(3); };

    e.addListener(() => { callOrder.push(1); }, {});
    e.addListener(() => { callOrder.push(2); }, {});
    e.addListener(r);

    e.emit();
    e.removeListener(r);
    e.emit();

    expect(callOrder).toStrictEqual([1, 2, 3, 1, 2]);
  });

  it("removeAllListeners should stop the all listeners from being called", () => {
    const callOrder: number[] = [];
    const e = new EventEmitter<[]>();

    e.addListener(() => { callOrder.push(1); });
    e.addListener(() => { callOrder.push(2); });
    e.addListener(() => { callOrder.push(3); });

    e.emit();
    e.removeAllListeners();
    e.emit();

    expect(callOrder).toStrictEqual([1, 2, 3]);
  });
});
