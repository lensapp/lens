import { getDi } from "./get-di";
import { execInjectable } from "./exec.injectable";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import { DoWebpackBuild, doWebpackBuildInjectable } from "./do-webpack-build";
import { getPromiseStatus } from "@ogre-tools/test-utils";
import { LogSuccess, logSuccessInjectable } from "./log-success.injectable";
import { LogWarning, logWarningInjectable } from "./log-warning.injectable";

describe("do-webpack-build", () => {
  let execMock: jest.Mock;
  let doWebpackBuild: DoWebpackBuild;
  let logSuccessMock: AsyncFnMock<LogSuccess>;
  let logWarningMock: AsyncFnMock<LogWarning>;
  let execResultStub: { stdout: { on: any }; stderr: { on: any }; on: any };

  beforeEach(() => {
    const di = getDi();

    execResultStub = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn(),
    };
    execMock = jest.fn().mockReturnValue(execResultStub);
    di.override(execInjectable, () => execMock as any);
    logSuccessMock = asyncFn();
    di.override(logSuccessInjectable, () => logSuccessMock);
    logWarningMock = asyncFn();
    di.override(logWarningInjectable, () => logWarningMock);

    doWebpackBuild = di.inject(doWebpackBuildInjectable);
  });

  it('given watching, when called, calls webpack with watch', () => {
    doWebpackBuild({ watch: true});

    expect(execMock).toHaveBeenCalledWith("webpack --watch");
  });

  it('given not watching, when called, calls webpack without watch', () => {
    doWebpackBuild({ watch: false});

    expect(execMock).toHaveBeenCalledWith("webpack");
  });

  describe("normally, when called", () => {
    let actualPromise: Promise<void>;

    beforeEach(() => {
      actualPromise = doWebpackBuild({ watch: true});
    });

    it("calls webpack", () => {
      expect(execMock).toHaveBeenCalled();
    });

    it("data in stdout logs as success", () => {
      const listeners = execResultStub.stdout.on.mock.calls;

      expect(listeners).toEqual([["data", logSuccessMock]]);
    });

    it("data in stderr logs as warning", () => {
      const listeners = execResultStub.stderr.on.mock.calls;

      expect(listeners).toEqual([["data", logWarningMock]]);
    });

    it("script is not done yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it("when execution of webpack exits, script is done", async () => {
      const [[eventName, finishWebpack]] = execResultStub.on.mock.calls;

      eventName === "exit" && finishWebpack();

      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(true);
    });
  });
});
