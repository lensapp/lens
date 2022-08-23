/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { createContainer, getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "./run-many-for";
import { runManyFor } from "./run-many-for";
import { getPromiseStatus } from "../test-utils/get-promise-status";

describe("runManyFor", () => {
  describe("given no hierarchy, when running many", () => {
    let runMock: AsyncFnMock<(...args: unknown[]) => Promise<void>>;
    let actualPromise: Promise<void>;

    beforeEach(() => {
      const rootDi = createContainer("irrelevant");

      runMock = asyncFn();

      const someInjectionTokenForRunnables = getInjectionToken<Runnable>({
        id: "some-injection-token",
      });

      const someInjectable = getInjectable({
        id: "some-injectable",
        instantiate: () => ({ run: () => runMock("some-call") }),
        injectionToken: someInjectionTokenForRunnables,
      });

      const someOtherInjectable = getInjectable({
        id: "some-other-injectable",
        instantiate: () => ({ run: () => runMock("some-other-call") }),
        injectionToken: someInjectionTokenForRunnables,
      });

      rootDi.register(someInjectable, someOtherInjectable);

      const runMany = runManyFor(rootDi)(someInjectionTokenForRunnables);

      actualPromise = runMany() as Promise<void>;
    });

    it("runs all runnables at the same time", () => {
      expect(runMock.mock.calls).toEqual([
        ["some-call"],
        ["some-other-call"],
      ]);
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
    let runMock: AsyncFnMock<(...args: unknown[]) => Promise<void>>;
    let actualPromise: Promise<void>;

    beforeEach(() => {
      const di = createContainer("irrelevant");

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

      actualPromise = runMany() as Promise<void>;
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

  it("given invalid hierarchy, when running runnables, throws", () => {
    const rootDi = createContainer("irrelevant");

    const runMock = asyncFn<(...args: unknown[]) => void>();

    const someInjectionToken = getInjectionToken<Runnable>({
      id: "some-injection-token",
    });

    const someOtherInjectionToken = getInjectionToken<Runnable>({
      id: "some-other-injection-token",
    });

    const someInjectable = getInjectable({
      id: "some-runnable-1",

      instantiate: (di) => ({
        run: () => runMock("some-runnable-1"),
        runAfter: di.inject(someOtherInjectable),
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

    const runMany = runManyFor(rootDi)(
      someInjectionToken,
    );

    return expect(() => runMany()).rejects.toThrow(
      "Tried to run runnable after other runnable which does not same injection token.",
    );
  });

  describe("when running many with parameter", () => {
    let runMock: AsyncFnMock<(...args: unknown[]) => Promise<void>>;

    beforeEach(() => {
      const rootDi = createContainer("irrelevant");

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
