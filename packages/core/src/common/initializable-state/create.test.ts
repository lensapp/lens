/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { Runnable } from "@k8slens/run-many";
import { runManyFor } from "@k8slens/run-many";
import type { DiContainer, Injectable, InjectionToken } from "@ogre-tools/injectable";
import { createContainer, getInjectionToken } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import type { ImplInitializableInjectionTokensArgs, Initializable, InitializableState } from "./create";
import { getInjectablesForInitializable, getInitializable, createInitializableState } from "./create";

describe("InitializableState tests", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();
  });

  describe("when created", () => {
    let stateInjectable: Injectable<InitializableState<number>, unknown, void>;
    let initMock: AsyncFnMock<() => number>;

    beforeEach(() => {
      initMock = asyncFn();
      stateInjectable = createInitializableState({
        id: "my-state",
        init: initMock,
      });

      runInAction(() => {
        di.register(stateInjectable);
      });
    });

    describe("when injected", () => {
      let state: InitializableState<number>;

      beforeEach(() => {
        state = di.inject(stateInjectable);
      });

      it("when get is called, throw", () => {
        expect(() => state.get()).toThrowError("InitializableState(my-state) has not been initialized yet");
      });

      describe("when init is called", () => {
        beforeEach(() => {
          state.init();
        });

        it("should call provided initialization function", () => {
          expect(initMock).toBeCalled();
        });

        it("when get is called, throw", () => {
          expect(() => state.get()).toThrowError("InitializableState(my-state) has not finished initializing");
        });

        describe("when initialization resolves", () => {
          beforeEach(async () => {
            await initMock.resolve(42);
          });

          it("when get is called, returns value", () => {
            expect(state.get()).toBe(42);
          });

          it("when init is called again, throws", async () => {
            await expect(() => state.init()).rejects.toThrow("Cannot initialize InitializableState(my-state) more than once");
          });
        });
      });
    });
  });
});

describe("InitializableTokens technical tests", () => {
  let di: DiContainer;
  let initializableToken: Initializable<number>;
  let phase: InjectionToken<Runnable<void>, void>;

  beforeEach(() => {
    di = createContainer("irrelevant");

    initializableToken = getInitializable("some-root-id");
    phase = getInjectionToken({ id: "some-runnable-phase" });
  });

  it("throws given attempting to inject the state token", () => {
    expect(() => di.inject(initializableToken.stateToken)).toThrowErrorMatchingInlineSnapshot(
      `"Tried to inject non-registered injectable "irrelevant" -> "some-root-id-state-token"."`,
    );
  });

  describe("given some implementation for initializableToken is registered", () => {
    let mockInit: AsyncFnMock<ImplInitializableInjectionTokensArgs<number>["init"]>;

    beforeEach(() => {
      mockInit = asyncFn();

      const { initializationInjectable, stateInjectable } = getInjectablesForInitializable({
        init: mockInit,
        phase,
        token: initializableToken,
      });

      di.register(initializationInjectable, stateInjectable);
    });

    it("throws given attempting to inject the state token", () => {
      expect(() => di.inject(initializableToken.stateToken)).toThrowErrorMatchingInlineSnapshot(
        `"Tried to inject "some-root-id" before initialization was complete"`,
      );
    });

    describe("given the phase is started to be run", () => {
      let runManyPromise: Promise<void>;

      beforeEach(() => {
        runManyPromise = runManyFor(di)(phase)();
      });

      it("throws given attempting to inject the state token", () => {
        expect(() => di.inject(initializableToken.stateToken)).toThrowErrorMatchingInlineSnapshot(
          `"Tried to inject "some-root-id" before initialization was complete"`,
        );
      });

      describe("when initialization is complete", () => {
        beforeEach(async () => {
          await mockInit.resolve(10);
        });

        it("initializes the state", () => {
          expect(di.inject(initializableToken.stateToken)).toBe(10);
        });

        it("allows the runMany to complete", async () => {
          await runManyPromise;
        });
      });
    });
  });
});
