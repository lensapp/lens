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

    e.addListener(() => 0 as any, {});
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
