/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createContainer, getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { runManySyncFor } from "./run-many-sync-for";
import type { RunnableSync } from "./types";

describe("runManySyncFor", () => {
  describe("given hierarchy, when running many", () => {
    let runMock: jest.Mock;

    beforeEach(() => {
      const rootDi = createContainer("irrelevant");

      runMock = jest.fn();

      const someInjectionTokenForRunnables = getInjectionToken<RunnableSync>({
        id: "some-injection-token",
      });

      const someInjectable = getInjectable({
        id: "some-injectable",
        instantiate: () => ({
          run: () => runMock("some-call"),
        }),
        injectionToken: someInjectionTokenForRunnables,
      });

      const someOtherInjectable = getInjectable({
        id: "some-other-injectable",
        instantiate: () => ({
          run: () => runMock("some-other-call"),
        }),
        injectionToken: someInjectionTokenForRunnables,
      });

      rootDi.register(someInjectable, someOtherInjectable);

      const runMany = runManySyncFor(rootDi)(someInjectionTokenForRunnables);

      runMany();
    });

    it("runs all runnables at the same time", () => {
      expect(runMock.mock.calls).toEqual([
        ["some-call"],
        ["some-other-call"],
      ]);
    });
  });

  describe("given hierarchy that is three levels deep, when running many", () => {
    let runMock: jest.Mock<(arg: string) => void>;

    beforeEach(() => {
      const di = createContainer("irrelevant");

      runMock = jest.fn();

      const someInjectionTokenForRunnables = getInjectionToken<RunnableSync>({
        id: "some-injection-token",
      });

      const someInjectable1 = getInjectable({
        id: "some-injectable-1",
        instantiate: () => ({
          run: () => void runMock("third-level-run"),
          runAfter: someInjectable2,
        }),
        injectionToken: someInjectionTokenForRunnables,
      });

      const someInjectable2 = getInjectable({
        id: "some-injectable-2",
        instantiate: () => ({
          run: () => void runMock("second-level-run"),
          runAfter: someInjectable3,
        }),
        injectionToken: someInjectionTokenForRunnables,
      });

      const someInjectable3 = getInjectable({
        id: "some-injectable-3",
        instantiate: () => ({
          run: () => void runMock("first-level-run"),
        }),
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

  it("given invalid hierarchy, when running runnables, throws", () => {
    const rootDi = createContainer("irrelevant");

    const runMock = jest.fn();

    const someInjectionToken = getInjectionToken<RunnableSync>({
      id: "some-injection-token",
    });

    const someOtherInjectionToken = getInjectionToken<RunnableSync>({
      id: "some-other-injection-token",
    });

    const someInjectable = getInjectable({
      id: "some-runnable-1",
      instantiate: () => ({
        run: () => runMock("some-runnable-1"),
        runAfter: someOtherInjectable,
      }),
      injectionToken: someInjectionToken,
    });

    const someOtherInjectable = getInjectable({
      id: "some-runnable-2",
      instantiate: () => ({
        run: () => runMock("some-runnable-2"),
      }),
      injectionToken: someOtherInjectionToken,
    });

    rootDi.register(someInjectable, someOtherInjectable);

    const runMany = runManySyncFor(rootDi)(
      someInjectionToken,
    );

    return expect(() => runMany()).toThrow(
      /Runnable "some-runnable-1" is unreachable for injection token "some-injection-token": run afters "some-runnable-2" are a part of different injection tokens./,
    );
  });

  describe("when running many with parameter", () => {
    let runMock: jest.Mock<(arg: string, arg2: string) => undefined>;

    beforeEach(() => {
      const rootDi = createContainer("irrelevant");

      runMock = jest.fn();

      const someInjectionTokenForRunnablesWithParameter = getInjectionToken<
        RunnableSync<string>
      >({
        id: "some-injection-token",
      });

      const someInjectable = getInjectable({
        id: "some-runnable-1",
        instantiate: () => ({
          run: (parameter) => void runMock("run-of-some-runnable-1", parameter),
        }),
        injectionToken: someInjectionTokenForRunnablesWithParameter,
      });

      const someOtherInjectable = getInjectable({
        id: "some-runnable-2",
        instantiate: () => ({
          run: (parameter) => void runMock("run-of-some-runnable-2", parameter),
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

