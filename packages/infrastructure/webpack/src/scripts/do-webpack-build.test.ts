import { getDi } from "./get-di";
import { Exec, execInjectable } from "./exec.injectable";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import { DoWebpackBuild, doWebpackBuildInjectable } from "./do-webpack-build";
import { getPromiseStatus } from "@k8slens/test-utils";
import { LogSuccess, logSuccessInjectable } from "./log-success.injectable";

describe("do-webpack-build", () => {
  let execMock: AsyncFnMock<Exec>;
  let doWebpackBuild: DoWebpackBuild;
  let logSuccessMock: AsyncFnMock<LogSuccess>;

  beforeEach(() => {
    const di = getDi();

    execMock = asyncFn();
    di.override(execInjectable, () => execMock);
    logSuccessMock = asyncFn();
    di.override(logSuccessInjectable, () => logSuccessMock);

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

      it("script finishes", async () => {
        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(true);
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

      it("throws", () => {
        return expect(actualPromise).rejects.toThrow("some-stderr");
      });
    });

    describe("when webpack rejects", () => {
      beforeEach(() => {
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
