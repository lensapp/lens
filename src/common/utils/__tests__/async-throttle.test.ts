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

import { asyncThrottle } from "../async-throttle";
import { delay } from "../delay";

describe("asyncThrottle", () => {
  it("should not call wrapped function between calls less than cooldownPeriod apart", async () => {
    let i = 0;
    const fn = asyncThrottle(async () => {
      return ++i;
    }, 100);

    expect(await fn()).toBe(1);
    expect(await fn()).toBe(1);
    expect(await fn()).toBe(1);
    expect(await fn()).toBe(1);
    expect(await fn()).toBe(1);
  });

  it("should only call wrapped function once if it takes longer than cooldownPeriod to settle", async () => {
    let i = 0;
    const fn = asyncThrottle(async () => {
      await delay(150);

      return ++i;
    }, 100);

    const f0 = fn();
    
    await delay(110);

    expect(await f0).toBe(1);

    const [f1, f2, f3, f4] = [fn(), fn(), fn(), fn()];
    
    expect(await f1).toBe(2);
    expect(await f2).toBe(2);
    expect(await f3).toBe(2);
    expect(await f4).toBe(2);
  });
});
