/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { isPromise } from "./is-promise";

describe("isPromise", () => {
  it("given promise, returns true", () => {
    const actual = isPromise(new Promise(() => {}));

    expect(actual).toBe(true);
  });

  it("given non-promise, returns false", () => {
    const actual = isPromise({});

    expect(actual).toBe(false);
  });

  it("given thenable, returns false", () => {
    const actual = isPromise({ then: () => {} });

    expect(actual).toBe(false);
  });

  it("given nothing, returns false", () => {
    const actual = isPromise(undefined);

    expect(actual).toBe(false);
  });
});
