/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { StartableStoppable, SyncStartableStoppable } from "./get-startable-stoppable";
import { getSyncStartableStoppable, getStartableStoppable } from "./get-startable-stoppable";
import { getPromiseStatus } from "../test-utils/get-promise-status";
import { flushPromises } from "../test-utils/flush-promises";

describe("getStartableStoppable", () => {
  let stopMock: AsyncFnMock<() => Promise<void>>;
  let startMock: AsyncFnMock<() => Promise<() => Promise<void>>>;
  let actual: StartableStoppable;

  beforeEach(() => {
    stopMock = asyncFn();
    startMock = asyncFn();

    actual = getStartableStoppable("some-id", startMock);
  });

  it("does not start yet", () => {
    expect(startMock).not.toHaveBeenCalled();
  });

  it("does not stop yet", () => {
    expect(stopMock).not.toHaveBeenCalled();
  });

  it("when stopping before ever starting, throws", () => {
    expect(async () => actual.stop()).rejects.toThrow("Tried to stop \"some-id\", but it is already stopped.");
  });

  it("is not started", () => {
    expect(actual.started).toBe(false);
  });

  describe("when started", () => {
    let startPromise: Promise<void>;

    beforeEach(() => {
      startPromise = actual.start();
    });

    it("starts starting", () => {
      expect(startMock).toHaveBeenCalled();
    });

    it("starting does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(startPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it("is not started yet", () => {
      expect(actual.started).toBe(false);
    });

    describe("when started again before the start has finished", () => {
      let error: Error;

      beforeEach(() => {
        startMock.mockClear();

        actual.start().catch((e) => { error = e; });
      });

      it("does not start starting again", () => {
        expect(startMock).not.toHaveBeenCalled();
      });

      it("throws", () => {
        expect(error.message).toBe("Tried to start \"some-id\", but it is already starting.");
      });
    });

    describe("when starting finishes", () => {
      beforeEach(async () => {
        await startMock.resolve(stopMock);
      });

      it("is started", () => {
        expect(actual.started).toBe(true);
      });

      it("starting resolves", async () => {
        const promiseStatus = await getPromiseStatus(startPromise);

        expect(promiseStatus.fulfilled).toBe(true);
      });

      it("when started again, throws", () => {
        expect(actual.start).rejects.toThrow("Tried to start \"some-id\", but it is already started.");
      });

      it("does not stop yet", () => {
        expect(stopMock).not.toHaveBeenCalled();
      });

      describe("when stopped", () => {
        let stopPromise: Promise<void>;

        beforeEach(() => {
          stopPromise = actual.stop();
        });

        it("starts stopping", () => {
          expect(stopMock).toHaveBeenCalled();
        });

        it("stopping does not resolve yet", async () => {
          const promiseStatus = await getPromiseStatus(stopPromise);

          expect(promiseStatus.fulfilled).toBe(false);
        });

        it("is not stopped yet", () => {
          expect(actual.started).toBe(true);
        });

        describe("when stopping finishes", () => {
          beforeEach(async () => {
            await stopMock.resolve();
          });

          it("is not started", () => {
            expect(actual.started).toBe(false);
          });

          it("stopping resolves", async () => {
            const promiseStatus = await getPromiseStatus(stopPromise);

            expect(promiseStatus.fulfilled).toBe(true);
          });

          it("when stopped again, throws", () => {
            expect(actual.stop).rejects.toThrow("Tried to stop \"some-id\", but it is already stopped.");
          });

          describe("when started again", () => {
            beforeEach(
              () => {
                startMock.mockClear();

                actual.start();
              });

            it("starts", () => {
              expect(startMock).toHaveBeenCalled();
            });

            it("is not started yet", () => {
              expect(actual.started).toBe(false);
            });

            describe("when starting finishes", () => {
              beforeEach(async () => {
                await startMock.resolve(stopMock);
              });

              it("is started", () => {
                expect(actual.started).toBe(true);
              });

              it("when stopped again, starts stopping again", async () => {
                stopMock.mockClear();

                actual.stop();

                await flushPromises();

                expect(stopMock).toHaveBeenCalled();
              });
            });
          });
        });
      });
    });

    describe("when stopped before starting finishes", () => {
      let stopPromise: Promise<void>;

      beforeEach(() => {
        stopPromise = actual.stop();
      });

      it("does not resolve yet", async () => {
        const promiseStatus = await getPromiseStatus(stopPromise);

        expect(promiseStatus.fulfilled).toBe(false);
      });

      it("is not started yet", () => {
        expect(actual.started).toBe(false);
      });

      describe("when starting finishes", () => {
        beforeEach(async () => {
          await startMock.resolve(stopMock);
        });

        it("starts stopping", () => {
          expect(stopMock).toHaveBeenCalled();
        });

        it("is not stopped yet", () => {
          expect(actual.started).toBe(true);
        });

        it("does not resolve yet", async () => {
          const promiseStatus = await getPromiseStatus(stopPromise);

          expect(promiseStatus.fulfilled).toBe(false);
        });

        describe("when stopping finishes", () => {
          beforeEach(async () => {
            await stopMock.resolve();
          });

          it("is stopped", () => {
            expect(actual.started).toBe(false);
          });

          it("resolves", async () => {
            const promiseStatus = await getPromiseStatus(stopPromise);

            expect(promiseStatus.fulfilled).toBe(true);
          });
        });
      });
    });
  });
});

describe("getSyncStartableStoppable", () => {
  let stopMock: jest.MockedFunction<() => void>;
  let startMock: jest.MockedFunction<() => () => void>;
  let actual: SyncStartableStoppable;

  beforeEach(() => {
    stopMock = jest.fn();
    startMock = jest.fn().mockImplementation(() => stopMock);
    actual = getSyncStartableStoppable("some-id", startMock);
  });

  it("does not start yet", () => {
    expect(startMock).not.toHaveBeenCalled();
  });

  it("does not stop yet", () => {
    expect(stopMock).not.toHaveBeenCalled();
  });

  it("when stopping before ever starting, throws", () => {
    expect(() => actual.stop()).toThrow("Tried to stop \"some-id\", but it is already stopped.");
  });

  it("is not started", () => {
    expect(actual.started).toBe(false);
  });

  describe("when started", () => {
    beforeEach(() => {
      actual.start();
    });

    it("calls start function", () => {
      expect(startMock).toHaveBeenCalled();
    });

    it("is started", () => {
      expect(actual.started).toBe(true);
    });

    describe("when stopped", () => {
      beforeEach(() => {
        actual.stop();
      });

      it("calls stop function", () => {
        expect(stopMock).toBeCalled();
      });

      it("is stopped", () => {
        expect(actual.started).toBe(false);
      });
    });
  });
});
