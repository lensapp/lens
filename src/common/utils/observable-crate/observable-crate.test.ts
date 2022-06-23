/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ObservableCrate } from "./impl";
import { observableCrate } from "./impl";

describe("observable-crate", () => {
  it("can be constructed with initial value", () => {
    expect(() => observableCrate(0).build()).not.toThrow();
  });

  it("has a definite type if the initial value is provided", () => {
    expect (() => {
      const res: ObservableCrate<number> = observableCrate(0).build();

      void res;
    }).not.toThrow();
  });

  it("accepts a map of transitionHandlers", () => {
    expect(() => observableCrate(0).withHandlers(new Map())).not.toThrow();
  });

  describe("with a crate over an enum, and some transition handlers", () => {
    enum Test {
      Start,
      T1,
      End,
    }

    let crate: ObservableCrate<Test>;
    let correctHandler: jest.MockedFunction<() => void>;
    let incorrectHandler: jest.MockedFunction<() => void>;

    beforeEach(() => {
      correctHandler = jest.fn();
      incorrectHandler = jest.fn();
      crate = observableCrate(Test.Start).withHandlers(new Map([
        [Test.Start, new Map([
          [Test.Start, incorrectHandler],
          [Test.T1, correctHandler],
          [Test.End, incorrectHandler],
        ])],
        [Test.T1, new Map([
          [Test.Start, incorrectHandler],
          [Test.T1, incorrectHandler],
          [Test.End, incorrectHandler],
        ])],
        [Test.End, new Map([
          [Test.Start, incorrectHandler],
          [Test.T1, incorrectHandler],
          [Test.End, incorrectHandler],
        ])],
      ]));
    });

    it("initial value is available", () => {
      expect(crate.get()).toBe(Test.Start);
    });

    it("does not call any transition handler", () => {
      expect(correctHandler).not.toBeCalled();
      expect(incorrectHandler).not.toBeCalled();
    });

    describe("when setting a new value", () => {
      beforeEach(() => {
        crate.set(Test.T1);
      });

      it("calls the associated transition handler", () => {
        expect(correctHandler).toBeCalled();
      });

      it("does not call any other transition handler", () => {
        expect(incorrectHandler).not.toBeCalled();
      });

      it("new value is available", () => {
        expect(crate.get()).toBe(Test.T1);
      });
    });
  });
});
