/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import asyncFn, { AsyncFnMock } from "@async-fn/jest";

import {
  createContainer,
  getInjectable,
  getInjectionToken,
} from "@ogre-tools/injectable";

import { runManyFor, Runnable } from "./run-many-for";

describe("runManyFor", () => {
  describe("given no hierarchy, when running many", () => {
    let runMock: AsyncFnMock<() => Promise<void>>;
    let actualPromise: Promise<void>;

    beforeEach(() => {
      const rootDi = createContainer();

      runMock = asyncFn();

      const someInjectionTokenForRunnables = getInjectionToken<Runnable>({
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

      const runMany = runManyFor(rootDi)(someInjectionTokenForRunnables);

      actualPromise = runMany();
    });

    it("runs all runnables at the same time", () => {
      expect(runMock).toHaveBeenCalledTimes(2);
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it("when all runnables resolve, resolves", async () => {
      await Promise.all([runMock.resolve(), runMock.resolve()]);

      expect(await actualPromise).toBe(undefined);
    });
  });

  describe("given hierarchy that is three levels deep, when running many", () => {
    let runMock: AsyncFnMock<(arg: string) => Promise<void>>;
    let actualPromise: Promise<void>;

    beforeEach(() => {
      const di = createContainer();

      runMock = asyncFn();

      const someInjectionTokenForRunnables = getInjectionToken<Runnable>({
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

      const runMany = runManyFor(di)(someInjectionTokenForRunnables);

      actualPromise = runMany();
    });

    it("runs first level runnables", () => {
      expect(runMock.mock.calls).toEqual([["first-level-run"]]);
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    describe("when first level runnables resolve", () => {
      beforeEach(async () => {
        runMock.mockClear();

        await runMock.resolveSpecific(["first-level-run"]);
      });

      it("runs second level runnables", async () => {
        expect(runMock.mock.calls).toEqual([["second-level-run"]]);
      });

      it("does not resolve yet", async () => {
        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(false);
      });

      describe("when second level runnables resolve", () => {
        beforeEach(async () => {
          runMock.mockClear();

          await runMock.resolveSpecific(["second-level-run"]);
        });

        it("runs final third level runnables", async () => {
          expect(runMock.mock.calls).toEqual([["third-level-run"]]);
        });

        it("does not resolve yet", async () => {
          const promiseStatus = await getPromiseStatus(actualPromise);

          expect(promiseStatus.fulfilled).toBe(false);
        });

        describe("when final third level runnables resolve", () => {
          beforeEach(async () => {
            await runMock.resolveSpecific(["third-level-run"]);
          });

          it("resolves", async () => {
            const promiseStatus = await getPromiseStatus(actualPromise);

            expect(promiseStatus.fulfilled).toBe(true);
          });
        });
      });
    });
  });

  describe("when running many with parameter", () => {
    let runMock: AsyncFnMock<(arg: string, arg2: string) => Promise<void>>;

    beforeEach(() => {
      const rootDi = createContainer();

      runMock = asyncFn();

      const someInjectionTokenForRunnablesWithParameter = getInjectionToken<
        Runnable<string>
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

      const runMany = runManyFor(rootDi)(
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

const flushPromises = () => new Promise(setImmediate);

const getPromiseStatus = async (promise: Promise<unknown>) => {
  const status = { fulfilled: false };

  promise.finally(() => {
    status.fulfilled = true;
  });

  await flushPromises();

  return status;
};
