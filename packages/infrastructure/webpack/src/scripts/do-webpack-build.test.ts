import { getDi } from "./get-di";
import { Exec, execInjectable } from "./exec.injectable";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import { DoWebpackBuild, doWebpackBuildInjectable } from "./do-webpack-build";
import { getPromiseStatus } from "@ogre-tools/test-utils";
import { LogSuccess, logSuccessInjectable } from "./log-success.injectable";
import { LogWarning, logWarningInjectable } from "./log-warning.injectable";

describe("do-webpack-build", () => {
  let execMock: AsyncFnMock<Exec>;
  let doWebpackBuild: DoWebpackBuild;
  let logSuccessMock: AsyncFnMock<LogSuccess>;
  let logWarningMock: AsyncFnMock<LogWarning>;

  beforeEach(() => {
    const di = getDi();

    execMock = asyncFn();
    di.override(execInjectable, () => execMock);
    logSuccessMock = asyncFn();
    di.override(logSuccessInjectable, () => logSuccessMock);
    logWarningMock = asyncFn();
    di.override(logWarningInjectable, () => logWarningMock);

    doWebpackBuild = di.inject(doWebpackBuildInjectable);
  });

  describe("when called", () => {
    let actualPromise: Promise<void>;

    beforeEach(() => {
      actualPromise = doWebpackBuild();
    });

    it("calls webpack", () => {
      expect(execMock).toHaveBeenCalledWith("webpack");
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    describe("when webpack resolves with stdout", () => {
      beforeEach(async () => {
        await execMock.resolve({ stdout: "some-stdout", stderr: "" });
      });

      it("logs the stdout", () => {
        expect(logSuccessMock).toHaveBeenCalledWith("some-stdout");
      });

      it("makes the built package available for local packages in development that link to it", () => {
        expect(execMock).toHaveBeenCalledWith("linkable-push");
      });

      it("does not finish script yet", async () => {
        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(false);
      });

      describe("when linking resolves with stdout", () => {
        beforeEach(async () => {
          logSuccessMock.mockClear();

          await execMock.resolve({ stdout: "some-other-stdout", stderr: "" });
        });

        it("logs the stdout", () => {
          expect(logSuccessMock).toHaveBeenCalledWith("some-other-stdout");
        });

        it("script finishes", async () => {
          const promiseStatus = await getPromiseStatus(actualPromise);

          expect(promiseStatus.fulfilled).toBe(true);
        });
      });

      describe("when linking resolves with stderr", () => {
        beforeEach(() => {
          logSuccessMock.mockClear();

          execMock.resolve({ stdout: "", stderr: "some-other-stderr" });
        });

        it("does not log success", () => {
          actualPromise.catch(() => {});

          expect(logSuccessMock).not.toHaveBeenCalled();
        });

        it("logs a warning", () => {
          expect(logWarningMock).toBeCalledWith("Warning while executing \"linkable-push\": some-other-stderr");
        });
      });

      describe("when linking rejects", () => {
        beforeEach(() => {
          logSuccessMock.mockClear();

          execMock.reject(new Error("some-other-error"));
        });

        it("does not log success", () => {
          actualPromise.catch(() => {});

          expect(logSuccessMock).not.toHaveBeenCalled();
        });

        it("throws", () => {
          return expect(actualPromise).rejects.toThrow("some-other-error");
        });
      });
    });

    describe("when webpack resolves with stderr", () => {
      beforeEach(() => {
        execMock.resolve({ stdout: "", stderr: "some-stderr" });
      });

      it("does not log success", () => {
        actualPromise.catch(() => {});

        expect(logSuccessMock).not.toHaveBeenCalled();
      });

      it("logs a warning", () => {
        expect(logWarningMock).toBeCalledWith("Warning while executing \"webpack\": some-stderr");
      });
    });

    describe("when webpack rejects", () => {
      beforeEach(async () => {
        execMock.reject(new Error("some-error"));
      });

      it("does not log success", () => {
        actualPromise.catch(() => {});

        expect(logSuccessMock).not.toHaveBeenCalled();
      });

      it("throws", () => {
        return expect(actualPromise).rejects.toThrow("some-error");
      });
    });
  });
});
