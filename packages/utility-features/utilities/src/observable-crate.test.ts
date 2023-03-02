/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ObservableCrate } from "./observable-crate";
import { observableCrate } from "./observable-crate";

describe("observable-crate", () => {
  it("can be constructed with initial value", () => {
    expect(() => observableCrate(0)).not.toThrow();
  });

  it("has a definite type if the initial value is provided", () => {
    expect (() => {
      const res: ObservableCrate<number> = observableCrate(0);

      void res;
    }).not.toThrow();
  });

  it("accepts an array of transitionHandlers", () => {
    expect(() => observableCrate(0, [])).not.toThrow();
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
      crate = observableCrate(Test.Start, [
        {
          from: Test.Start,
          to: Test.Start,
          onTransition: incorrectHandler,
        },
        {
          from: Test.Start,
          to: Test.T1,
          onTransition: correctHandler,
        },
        {
          from: Test.Start,
          to: Test.End,
          onTransition: incorrectHandler,
        },
        {
          from: Test.T1,
          to: Test.Start,
          onTransition: incorrectHandler,
        },
        {
          from: Test.T1,
          to: Test.T1,
          onTransition: incorrectHandler,
        },
        {
          from: Test.T1,
          to: Test.End,
          onTransition: incorrectHandler,
        },
        {
          from: Test.End,
          to: Test.Start,
          onTransition: incorrectHandler,
        },
        {
          from: Test.End,
          to: Test.T1,
          onTransition: incorrectHandler,
        },
        {
          from: Test.End,
          to: Test.End,
          onTransition: incorrectHandler,
        },
      ]);
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
