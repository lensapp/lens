/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { DiContainer, Injectable } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import type { Runnable } from "../runnable/run-many-for";
import type { InitializableState } from "./create";
import { createInitializableState } from "./create";

describe("InitializableState tests", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
  });

  describe("when created", () => {
    let stateInjectable: Injectable<InitializableState<number>, unknown, void>;
    let initStateInjectable: Injectable<Runnable<void>, Runnable<void>, void>;
    let initMock: AsyncFnMock<() => number>;

    beforeEach(() => {
      initMock = asyncFn();
      ({
        value: stateInjectable,
        initializer: initStateInjectable,
      } = createInitializableState({
        id: "my-state",
        init: initMock,
        when: null as any,
      }));

      runInAction(() => {
        di.register(stateInjectable);
        di.register(initStateInjectable);
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
        beforeEach(async () => {
          const initState = di.inject(initStateInjectable);

          await initState.run();
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
            const initState = di.inject(initStateInjectable);

            await expect(() => initState.run()).rejects.toThrow("Cannot initialize InitializableState(my-state) more than once");
          });
        });
      });
    });
  });
});
