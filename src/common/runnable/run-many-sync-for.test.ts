/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  createContainer,
  getInjectable,
  getInjectionToken,
} from "@ogre-tools/injectable";

import type { RunnableSync } from "./run-many-sync-for";
import { runManySyncFor } from "./run-many-sync-for";

describe("runManySyncFor", () => {
  describe("given hierarchy, when running many", () => {
    let runMock: jest.Mock;

    beforeEach(() => {
      const rootDi = createContainer();

      runMock = jest.fn();

      const someInjectionTokenForRunnables = getInjectionToken<RunnableSync>({
        id: "some-injection-token",
      });

      const someInjectable = getInjectable({
        id: "some-injectable",
        instantiate: () => ({ run: runMock }),
        injectionToken: someInjectionTokenForRunnables,
      });

      const someOtherInjectable = getInjectable({
        id: "some-other-injectable",
        instantiate: () => ({ run: runMock }),
        injectionToken: someInjectionTokenForRunnables,
      });

      rootDi.register(someInjectable, someOtherInjectable);

      const runMany = runManySyncFor(rootDi)(someInjectionTokenForRunnables);

      runMany();
    });

    it("runs all runnables at the same time", () => {
      expect(runMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("given hierarchy that is three levels deep, when running many", () => {
    let runMock: jest.Mock<(arg: string) => void>;

    beforeEach(() => {
      const di = createContainer();

      runMock = jest.fn();

      const someInjectionTokenForRunnables = getInjectionToken<RunnableSync>({
        id: "some-injection-token",
      });

      const someInjectable1 = getInjectable({
        id: "some-injectable-1",

        instantiate: (di) => ({
          run: () => runMock("third-level-run"),
          runAfter: di.inject(someInjectable2),
        }),

        injectionToken: someInjectionTokenForRunnables,
      });

      const someInjectable2 = getInjectable({
        id: "some-injectable-2",

        instantiate: (di) => ({
          run: () => runMock("second-level-run"),
          runAfter: di.inject(someInjectable3),
        }),

        injectionToken: someInjectionTokenForRunnables,
      });

      const someInjectable3 = getInjectable({
        id: "some-injectable-3",
        instantiate: () => ({ run: () => runMock("first-level-run") }),
        injectionToken: someInjectionTokenForRunnables,
      });

      di.register(someInjectable1, someInjectable2, someInjectable3);

      const runMany = runManySyncFor(di)(someInjectionTokenForRunnables);

      runMany();
    });

    it("runs runnables in order", () => {
      expect(runMock.mock.calls).toEqual([["first-level-run"], ["second-level-run"], ["third-level-run"]]);
    });
  });

  describe("when running many with parameter", () => {
    let runMock: jest.Mock<(arg: string, arg2: string) => void>;

    beforeEach(() => {
      const rootDi = createContainer();

      runMock = jest.fn();

      const someInjectionTokenForRunnablesWithParameter = getInjectionToken<
        RunnableSync<string>
      >({
        id: "some-injection-token",
      });

      const someInjectable = getInjectable({
        id: "some-runnable-1",

        instantiate: () => ({
          run: (parameter) => runMock("run-of-some-runnable-1", parameter),
        }),

        injectionToken: someInjectionTokenForRunnablesWithParameter,
      });

      const someOtherInjectable = getInjectable({
        id: "some-runnable-2",

        instantiate: () => ({
          run: (parameter) => runMock("run-of-some-runnable-2", parameter),
        }),

        injectionToken: someInjectionTokenForRunnablesWithParameter,
      });

      rootDi.register(someInjectable, someOtherInjectable);

      const runMany = runManySyncFor(rootDi)(
        someInjectionTokenForRunnablesWithParameter,
      );

      runMany("some-parameter");
    });

    it("runs all runnables using the parameter", () => {
      expect(runMock.mock.calls).toEqual([
        ["run-of-some-runnable-1", "some-parameter"],
        ["run-of-some-runnable-2", "some-parameter"],
      ]);
    });
  });
});

