/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { DiContainer, Injectable } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import type { InitializableState } from "./create";
import { createInitializableState } from "./create";

describe("InitializableState tests", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
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
