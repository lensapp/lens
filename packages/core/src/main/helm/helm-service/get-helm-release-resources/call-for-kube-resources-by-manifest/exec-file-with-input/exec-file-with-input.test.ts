/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../../../../../getDiForUnitTesting";
import type { ExecFileWithInput } from "./exec-file-with-input.injectable";
import execFileWithInputInjectable from "./exec-file-with-input.injectable";
import type { AsyncResult } from "@k8slens/utilities";
import nonPromiseExecFileInjectable from "./non-promise-exec-file.injectable";
import { getPromiseStatus } from "@k8slens/test-utils";
import EventEmitter from "events";

describe("exec-file-with-input", () => {
  let execFileWithInput: ExecFileWithInput;
  let execFileMock: jest.Mock;

  let executionStub: EventEmitter & {
    stdin: { end: (chunk: any) => void };
    stdout: EventEmitter;
    stderr: EventEmitter;
  };

  beforeEach(() => {
    const di = getDiForUnitTesting();

    di.unoverride(execFileWithInputInjectable);

    executionStub = Object.assign(new EventEmitter(), {
      stdin: { end: jest.fn() },
      stdout: new EventEmitter(),
      stderr: new EventEmitter(),
    });

    execFileMock = jest.fn(() => executionStub);

    di.override(nonPromiseExecFileInjectable, () => execFileMock as any);

    execFileWithInput = di.inject(execFileWithInputInjectable);
  });

  it("given call, when throws synchronously, resolves with failure", async () => {
    execFileMock.mockImplementation(() => {
      throw new Error("some-error");
    });

    const actual = await execFileWithInput({
      filePath: "./irrelevant",
      commandArguments: ["irrelevant"],
      input: "irrelevant",
    });

    expect(actual).toEqual({
      callWasSuccessful: false,
      error: expect.any(Error),
    });
  });

  describe("when called", () => {
    let actualPromise: AsyncResult<string, unknown>;

    beforeEach(() => {
      actualPromise = execFileWithInput({
        filePath: "./some-file-path",
        commandArguments: ["some-arg", "some-other-arg"],
        input: "some-input",
      });
    });

    it("calls for file with arguments", () => {
      expect(execFileMock).toHaveBeenCalledWith(
        "./some-file-path",
        [
          "some-arg",
          "some-other-arg",
        ],
        { "maxBuffer": 8589934592 },
      );
    });

    it("calls with input", () => {
      expect(executionStub.stdin.end).toHaveBeenCalledWith("some-input");
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    describe("when stdout receives data", () => {
      beforeEach(() => {
        executionStub.stdout.emit("data", "some-data");
      });

      it("does not resolve yet", async () => {
        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(false);
      });

      describe("when stdout receives more data", () => {
        beforeEach(() => {
          executionStub.stdout.emit("data", "some-other-data");
        });

        it("does not resolve yet", async () => {
          const promiseStatus = await getPromiseStatus(actualPromise);

          expect(promiseStatus.fulfilled).toBe(false);
        });

        it("when execution exits with success, resolves with result", async () => {
          executionStub.emit("exit", 0);

          const actual = await actualPromise;

          expect(actual).toEqual({
            callWasSuccessful: true,
            response: "some-datasome-other-data",
          });
        });

        it("when execution exits without exit code, resolves with failure", async () => {
          executionStub.emit("exit", null, "SIGKILL");

          const actual = await actualPromise;

          expect(actual).toEqual({
            callWasSuccessful: false,
            error: "Exited via SIGKILL",
          });
        });

        it("when execution exits with failure, resolves with failure", async () => {
          executionStub.emit("exit", 42, "some-signal");

          const actual = await actualPromise;

          expect(actual).toEqual({
            callWasSuccessful: false,
            error: "Failed with error: some-signal",
          });
        });

        describe("when stderr receives data", () => {
          beforeEach(() => {
            executionStub.stderr.emit("data", "some-error");
          });

          it("does not resolve yet", async () => {
            const promiseStatus = await getPromiseStatus(actualPromise);

            expect(promiseStatus.fulfilled).toBe(false);
          });

          describe("when stderr receives more data", () => {
            beforeEach(() => {
              executionStub.stderr.emit("data", "some-other-error");
            });

            it("does not resolve yet", async () => {
              const promiseStatus = await getPromiseStatus(actualPromise);

              expect(promiseStatus.fulfilled).toBe(false);
            });

            it("when execution exits with success, resolves with result", async () => {
              executionStub.emit("exit", 0);

              const actual = await actualPromise;

              expect(actual).toEqual({
                callWasSuccessful: true,
                response: "some-datasome-other-data",
              });
            });

            it("when execution exits without exit code, resolves with failure", async () => {
              executionStub.emit("exit", null, "some-signal");

              const actual = await actualPromise;

              expect(actual).toEqual({
                callWasSuccessful: false,
                error: "Exited via some-signal",
              });
            });

            it("when execution exits with failure, resolves with errors", async () => {
              executionStub.emit("exit", 42, "irrelevant");

              const actual = await actualPromise;

              expect(actual).toEqual({
                callWasSuccessful: false,
                error: "some-errorsome-other-error",
              });
            });
          });
        });
      });
    });

    it("when execution receives error, resolves with error", async () => {
      executionStub.emit("error", new Error("some-error"));

      const actual = await actualPromise;

      expect(actual).toEqual({
        callWasSuccessful: false,
        error: expect.any(Error),
      });
    });
  });
});
