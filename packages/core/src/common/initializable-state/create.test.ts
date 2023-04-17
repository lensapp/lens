/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { Runnable } from "@k8slens/run-many";
import { runManyFor } from "@k8slens/run-many";
import type { DiContainer, InjectionToken } from "@ogre-tools/injectable";
import { createContainer, getInjectionToken } from "@ogre-tools/injectable";
import type { ImplInitializableInjectionTokensArgs, Initializable } from "./create";
import { getInjectablesForInitializable, getInitializable } from "./create";

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
