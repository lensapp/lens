/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { createContainer, getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "./types";
import { runManyFor } from "./run-many-for";
import { getPromiseStatus, flushPromises } from "@k8slens/test-utils";
import { runInAction } from "mobx";

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
        instantiate: () => ({
          run: () => runMock("third-level-run"),
          runAfter: someInjectable2,
        }),
        injectionToken: someInjectionTokenForRunnables,
      });

      const someInjectable2 = getInjectable({
        id: "some-injectable-2",
        instantiate: () => ({
          run: () => runMock("second-level-run"),
          runAfter: someInjectable3,
        }),
        injectionToken: someInjectionTokenForRunnables,
      });

      const someInjectable3 = getInjectable({
        id: "some-injectable-3",
        instantiate: () => ({
          run: () => runMock("first-level-run"),
        }),
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

    const runMany = runManyFor(rootDi)(
      someInjectionToken,
    );

    return expect(() => runMany()).rejects.toThrow(
      /Runnable "some-runnable-1" is unreachable for injection token "some-injection-token": run afters "some-runnable-2" are a part of different injection tokens./,
    );
  });

  it("given partially incorrect hierarchy, when running runnables, throws", () => {
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
      instantiate: () => ({
        run: () => runMock("some-runnable-1"),
        runAfter: [
          someOtherInjectable,
          someSecondInjectable,
        ],
      }),
      injectionToken: someInjectionToken,
    });

    const someSecondInjectable = getInjectable({
      id: "some-runnable-2",
      instantiate: () => ({
        run: () => runMock("some-runnable-2"),
      }),
      injectionToken: someInjectionToken,
    });

    const someOtherInjectable = getInjectable({
      id: "some-runnable-3",
      instantiate: () => ({
        run: () => runMock("some-runnable-3"),
      }),
      injectionToken: someOtherInjectionToken,
    });

    rootDi.register(someInjectable, someOtherInjectable, someSecondInjectable);

    const runMany = runManyFor(rootDi)(
      someInjectionToken,
    );

    return expect(() => runMany()).rejects.toThrow(
      /Runnable "some-runnable-3" is not part of the injection token "some-injection-token"/,
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

  describe("given multiple runAfters", () => {
    let runMock: AsyncFnMock<(...args: unknown[]) => void>;
    let finishingPromise: Promise<void>;

    beforeEach(async () => {
      const rootDi = createContainer("irrelevant");

      runMock = asyncFn<(...args: unknown[]) => void>();

      const someInjectionToken = getInjectionToken<Runnable>({
        id: "some-injection-token",
      });

      const runnableOneInjectable = getInjectable({
        id: "runnable-1",
        instantiate: () => ({
          run: () => runMock("runnable-1"),
        }),
        injectionToken: someInjectionToken,
      });

      const runnableTwoInjectable = getInjectable({
        id: "runnable-2",
        instantiate: () => ({
          run: () => runMock("runnable-2"),
          runAfter: [], // shouldn't block being called
        }),
        injectionToken: someInjectionToken,
      });

      const runnableThreeInjectable = getInjectable({
        id: "runnable-3",
        instantiate: () => ({
          run: () => runMock("runnable-3"),
          runAfter: runnableOneInjectable,
        }),
        injectionToken: someInjectionToken,
      });

      const runnableFourInjectable = getInjectable({
        id: "runnable-4",
        instantiate: () => ({
          run: () => runMock("runnable-4"),
          runAfter: [runnableThreeInjectable], // should be the same as an single item
        }),
        injectionToken: someInjectionToken,
      });

      const runnableFiveInjectable = getInjectable({
        id: "runnable-5",
        instantiate: () => ({
          run: () => runMock("runnable-5"),
          runAfter: runnableThreeInjectable,
        }),
        injectionToken: someInjectionToken,
      });

      const runnableSixInjectable = getInjectable({
        id: "runnable-6",
        instantiate: () => ({
          run: () => runMock("runnable-6"),
          runAfter: [
            runnableFourInjectable,
            runnableFiveInjectable,
          ],
        }),
        injectionToken: someInjectionToken,
      });

      const runnableSevenInjectable = getInjectable({
        id: "runnable-7",
        instantiate: () => ({
          run: () => runMock("runnable-7"),
          runAfter: [
            runnableFiveInjectable,
            runnableSixInjectable,
          ],
        }),
        injectionToken: someInjectionToken,
      });

      runInAction(() => {
        rootDi.register(
          runnableOneInjectable,
          runnableTwoInjectable,
          runnableThreeInjectable,
          runnableFourInjectable,
          runnableFiveInjectable,
          runnableSixInjectable,
          runnableSevenInjectable,
        );
      });

      const runMany = runManyFor(rootDi);
      const runSome = runMany(someInjectionToken);

      finishingPromise = runSome();

      await flushPromises();
    });

    it("should run 'runnable-1'", () => {
      expect(runMock).toBeCalledWith("runnable-1");
    });

    it("should run 'runnable-2'", () => {
      expect(runMock).toBeCalledWith("runnable-2");
    });

    it("should not run 'runnable-3'", () => {
      expect(runMock).not.toBeCalledWith("runnable-3");
    });

    describe("when 'runnable-1' resolves", () => {
      beforeEach(async () => {
        await runMock.resolveSpecific(["runnable-1"]);
      });

      it("should run 'runnable-3'", () => {
        expect(runMock).toBeCalledWith("runnable-3");
      });

      describe("when 'runnable-2' resolves", () => {
        beforeEach(async () => {
          await runMock.resolveSpecific(["runnable-2"]);
        });

        it("shouldn't call any more runnables", () => {
          expect(runMock).toBeCalledTimes(3);
        });
      });

      describe("when 'runnable-3' resolves", () => {
        beforeEach(async () => {
          await runMock.resolveSpecific(["runnable-3"]);
        });

        it("should run 'runnable-4'", () => {
          expect(runMock).toBeCalledWith("runnable-4");
        });

        it("should run 'runnable-5'", () => {
          expect(runMock).toBeCalledWith("runnable-5");
        });

        describe("when 'runnable-2' resolves", () => {
          beforeEach(async () => {
            await runMock.resolveSpecific(["runnable-2"]);
          });

          it("shouldn't call any more runnables", () => {
            expect(runMock).toBeCalledTimes(5);
          });
        });

        describe("when 'runnable-4' resolves", () => {
          beforeEach(async () => {
            await runMock.resolveSpecific(["runnable-4"]);
          });

          it("shouldn't call any more runnables", () => {
            expect(runMock).toBeCalledTimes(5);
          });

          describe("when 'runnable-2' resolves", () => {
            beforeEach(async () => {
              await runMock.resolveSpecific(["runnable-2"]);
            });

            it("shouldn't call any more runnables", () => {
              expect(runMock).toBeCalledTimes(5);
            });
          });

          describe("when 'runnable-5' resolves", () => {
            beforeEach(async () => {
              await runMock.resolveSpecific(["runnable-5"]);
            });

            it("should run 'runnable-6'", () => {
              expect(runMock).toBeCalledWith("runnable-6");
            });

            describe("when 'runnable-2' resolves", () => {
              beforeEach(async () => {
                await runMock.resolveSpecific(["runnable-2"]);
              });

              it("shouldn't call any more runnables", () => {
                expect(runMock).toBeCalledTimes(6);
              });
            });

            describe("when 'runnable-6' resolves", () => {
              beforeEach(async () => {
                await runMock.resolveSpecific(["runnable-6"]);
              });

              it("should run 'runnable-7'", () => {
                expect(runMock).toBeCalledWith("runnable-7");
              });

              describe("when 'runnable-2' resolves", () => {
                beforeEach(async () => {
                  await runMock.resolveSpecific(["runnable-2"]);
                });

                it("shouldn't call any more runnables", () => {
                  expect(runMock).toBeCalledTimes(7);
                });

                describe("when 'runnable-7' resolves", () => {
                  beforeEach(async () => {
                    await runMock.resolveSpecific(["runnable-7"]);
                  });

                  it("should resolve the runMany promise call", async () => {
                    await finishingPromise;
                  });
                });
              });
            });
          });
        });

        describe("when 'runnable-5' resolves", () => {
          beforeEach(async () => {
            await runMock.resolveSpecific(["runnable-5"]);
          });

          it("shouldn't call any more runnables", () => {
            expect(runMock).toBeCalledTimes(5);
          });

          describe("when 'runnable-2' resolves", () => {
            beforeEach(async () => {
              await runMock.resolveSpecific(["runnable-2"]);
            });

            it("shouldn't call any more runnables", () => {
              expect(runMock).toBeCalledTimes(5);
            });
          });

          describe("when 'runnable-4' resolves", () => {
            beforeEach(async () => {
              await runMock.resolveSpecific(["runnable-4"]);
            });

            it("should run 'runnable-6'", () => {
              expect(runMock).toBeCalledWith("runnable-6");
            });

            describe("when 'runnable-2' resolves", () => {
              beforeEach(async () => {
                await runMock.resolveSpecific(["runnable-2"]);
              });

              it("shouldn't call any more runnables", () => {
                expect(runMock).toBeCalledTimes(6);
              });
            });

            describe("when 'runnable-6' resolves", () => {
              beforeEach(async () => {
                await runMock.resolveSpecific(["runnable-6"]);
              });

              it("should run 'runnable-7'", () => {
                expect(runMock).toBeCalledWith("runnable-7");
              });

              describe("when 'runnable-2' resolves", () => {
                beforeEach(async () => {
                  await runMock.resolveSpecific(["runnable-2"]);
                });

                it("shouldn't call any more runnables", () => {
                  expect(runMock).toBeCalledTimes(7);
                });

                describe("when 'runnable-7' resolves", () => {
                  beforeEach(async () => {
                    await runMock.resolveSpecific(["runnable-7"]);
                  });

                  it("should resolve the runMany promise call", async () => {
                    await finishingPromise;
                  });
                });
              });
            });
          });
        });
      });
    });

    describe("when 'runnable-2' resolves", () => {
      beforeEach(async () => {
        await runMock.resolveSpecific(["runnable-2"]);
      });

      it("shouldn't call any more runnables", () => {
        expect(runMock).toBeCalledTimes(2);
      });
    });
  });
});
