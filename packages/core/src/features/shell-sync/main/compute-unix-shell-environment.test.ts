/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { ChildProcessWithoutNullStreams } from "child_process";
import EventEmitter from "events";
import { flushPromises } from "@k8slens/test-utils";
import type { Spawn } from "../../../main/child-process/spawn.injectable";
import spawnInjectable from "../../../main/child-process/spawn.injectable";
import randomUUIDInjectable from "../../../main/crypto/random-uuid.injectable";
import { getDiForUnitTesting } from "../../../main/getDiForUnitTesting";
import type { ComputeUnixShellEnvironment } from "./compute-unix-shell-environment.injectable";
import computeUnixShellEnvironmentInjectable from "./compute-unix-shell-environment.injectable";
import processEnvInjectable from "./env.injectable";
import processExecPathInjectable from "./execPath.injectable";
import MemoryStream from "memorystream";

const expectedEnv = {
  SOME_ENV_VAR: "some-env-value",
  ELECTRON_RUN_AS_NODE: "1",
  ELECTRON_NO_ATTACH_CONSOLE: "1",
  TERM: "screen-256color-bce",
  SOME_THIRD_NON_UNDEFINED_VALUE: "",
};

describe("computeUnixShellEnvironment technical tests", () => {
  let di: DiContainer;
  let computeUnixShellEnvironment: ComputeUnixShellEnvironment;
  let spawnMock: jest.MockedFunction<Spawn>;
  let shellProcessFake: ChildProcessWithoutNullStreams;
  let stdinValue: string;
  let shellStdin: MemoryStream;
  let shellStdout: MemoryStream;
  let shellStderr: MemoryStream;
  let unixShellEnv: ReturnType<ComputeUnixShellEnvironment>;

  beforeEach(() => {
    di = getDiForUnitTesting();

    spawnMock = jest.fn().mockImplementation((spawnfile, spawnargs) => {
      shellStdin = new MemoryStream();
      shellStdout = new MemoryStream();
      shellStderr = new MemoryStream();
      stdinValue = "";

      shellStdin.on("data", (chunk) => {
        stdinValue += chunk.toString();
      });

      return shellProcessFake = Object.assign(new EventEmitter(), {
        stdin: shellStdin,
        stdout: shellStdout,
        stderr: shellStderr,
        stdio: [
          shellStdin,
          shellStdout,
          shellStderr,
        ] as any,
        killed: false,
        kill: jest.fn(),
        send: jest.fn(),
        disconnect: jest.fn(),
        unref: jest.fn(),
        ref: jest.fn(),
        connected: false,
        exitCode: null,
        signalCode: null,
        spawnargs,
        spawnfile,
      });
    });
    di.override(spawnInjectable, () => spawnMock);
    di.override(randomUUIDInjectable, () => () => "dead-foo-bar-foo-beef");

    di.override(processEnvInjectable, () => ({
      SOME_ENV_VAR: "some-env-value",
      TERM: "some-other-value",
      SOME_THIRD_NON_UNDEFINED_VALUE: "",
    }));
    di.override(processExecPathInjectable, () => "/some/process/exec/path");

    di.unoverride(computeUnixShellEnvironmentInjectable);
    di.permitSideEffects(computeUnixShellEnvironmentInjectable);
    computeUnixShellEnvironment = di.inject(computeUnixShellEnvironmentInjectable);
  });

  describe.each([
    "/bin/csh",
    "/bin/tcsh",
  ])("when shell is %s", (shellPath) => {
    beforeEach(async () => {
      const controller = new AbortController();

      unixShellEnv = computeUnixShellEnvironment(shellPath, { signal: controller.signal });
      await flushPromises();
    });

    it("should spawn a process with the correct arguments", () => {
      expect(spawnMock).toBeCalledWith(
        shellPath,
        [
          "-l",
        ],
        expect.objectContaining({
          env: expectedEnv,
        }),
      );
    });

    it("should send the command via stdin", () => {
      expect(stdinValue).toBe(`'/some/process/exec/path' -p '"deadfoobarfoobeef" + JSON.stringify(process.env) + "deadfoobarfoobeef"'`);
    });

    it("should close stdin", () => {
      expect(shellStdin.readableEnded).toBe(true);
    });

    describe("when process errors", () => {
      beforeEach(() => {
        shellProcessFake.emit("error", new Error("some-error"));
      });

      it("should resolve with a failed call", async () => {
        await expect(unixShellEnv).resolves.toEqual({
          callWasSuccessful: false,
          error: `Failed to spawn ${shellPath}: ${JSON.stringify({
            error: "Error: some-error",
            stdout: "",
            stderr: "",
          }, null, 4)}`,
        });
      });
    });

    describe("when process exits with non-zero exit code", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 1, null);
      });

      it("should resolve with a failed call", async () => {
        await expect(unixShellEnv).resolves.toEqual({
          callWasSuccessful: false,
          error: 'Shell did not exit successfully: {\n    "code": 1,\n    "signal": null,\n    "stdout": "",\n    "stderr": ""\n}',
        });
      });
    });

    describe("when process exits with a signal", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 0, "SIGKILL");
      });

      it("should resolve with a failed call", async () => {
        await expect(unixShellEnv).resolves.toEqual({
          callWasSuccessful: false,
          error: 'Shell did not exit successfully: {\n    "code": 0,\n    "signal": "SIGKILL",\n    "stdout": "",\n    "stderr": ""\n}',
        });
      });
    });

    describe("when process stdout emits some data", () => {
      beforeEach(() => {
        const fakeInnerEnv = {
          PATH: "/bin",
          ...expectedEnv,
        };

        shellStdout.emit("data", Buffer.from(`some-other-datadeadfoobarfoobeef${JSON.stringify(fakeInnerEnv)}deadfoobarfoobeefsome-third-other-data`));
      });

      describe("when process successfully exits", () => {
        beforeEach(() => {
          shellProcessFake.emit("close", 0);
        });

        it("should resolve the env", async () => {
          await expect(unixShellEnv).resolves.toEqual({
            callWasSuccessful: true,
            response: {
              PATH: "/bin",
              SOME_ENV_VAR: "some-env-value",
              TERM: "some-other-value",
              SOME_THIRD_NON_UNDEFINED_VALUE: "",
            },
          });
        });
      });
    });
  });

  describe.each([
    "/bin/bash",
    "/bin/sh",
    "/bin/zsh",
  ])("when shell is %s", (shellPath) => {
    beforeEach(async () => {
      const controller = new AbortController();

      unixShellEnv = computeUnixShellEnvironment(shellPath, { signal: controller.signal });
      await flushPromises();
    });

    it("should spawn a process with the correct arguments", () => {
      expect(spawnMock).toBeCalledWith(
        shellPath,
        [
          "-l",
          "-i",
        ],
        expect.objectContaining({
          env: expectedEnv,
        }),
      );
    });

    it("should send the command via stdin", () => {
      expect(stdinValue).toBe(` '/some/process/exec/path' -p '"deadfoobarfoobeef" + JSON.stringify(process.env) + "deadfoobarfoobeef"'`);
    });

    it("should close stdin", () => {
      expect(shellStdin.readableEnded).toBe(true);
    });

    describe("when process errors", () => {
      beforeEach(() => {
        shellProcessFake.emit("error", new Error("some-error"));
      });

      it("should resolve with a failed call", async () => {
        await expect(unixShellEnv).resolves.toEqual({
          callWasSuccessful: false,
          error: `Failed to spawn ${shellPath}: ${JSON.stringify({
            error: "Error: some-error",
            stdout: "",
            stderr: "",
          }, null, 4)}`,
        });
      });
    });

    describe("when process exits with non-zero exit code", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 1, null);
      });

      it("should resolve with a failed call", async () => {
        await expect(unixShellEnv).resolves.toEqual({
          callWasSuccessful: false,
          error: 'Shell did not exit successfully: {\n    "code": 1,\n    "signal": null,\n    "stdout": "",\n    "stderr": ""\n}',
        });
      });
    });

    describe("when process exits with a signal", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 0, "SIGKILL");
      });

      it("should resolve with a failed call", async () => {
        await expect(unixShellEnv).resolves.toEqual({
          callWasSuccessful: false,
          error: 'Shell did not exit successfully: {\n    "code": 0,\n    "signal": "SIGKILL",\n    "stdout": "",\n    "stderr": ""\n}',
        });
      });
    });

    describe("when process stdout emits some data", () => {
      beforeEach(() => {
        const fakeInnerEnv = {
          PATH: "/bin",
          ...expectedEnv,
        };

        shellStdout.emit("data", Buffer.from(`some-other-datadeadfoobarfoobeef${JSON.stringify(fakeInnerEnv)}deadfoobarfoobeefsome-third-other-data`));
      });

      describe("when process successfully exits", () => {
        beforeEach(() => {
          shellProcessFake.emit("close", 0);
        });

        it("should resolve the env", async () => {
          await expect(unixShellEnv).resolves.toEqual({
            callWasSuccessful: true,
            response: {
              PATH: "/bin",
              SOME_ENV_VAR: "some-env-value",
              TERM: "some-other-value",
              SOME_THIRD_NON_UNDEFINED_VALUE: "",
            },
          });
        });
      });
    });
  });

  describe.each([
    "/usr/local/bin/fish",
  ])("when shell is %s", (shellPath) => {
    beforeEach(async () => {
      const controller = new AbortController();

      unixShellEnv = computeUnixShellEnvironment(shellPath, { signal: controller.signal });
      await flushPromises();
    });

    it("should spawn a process with the correct arguments", () => {
      expect(spawnMock).toBeCalledWith(
        shellPath,
        [
          "-l",
          "-c",
          `'/some/process/exec/path' -p '"deadfoobarfoobeef" + JSON.stringify(process.env) + "deadfoobarfoobeef"'`,
        ],
        expect.objectContaining({
          env: expectedEnv,
        }),
      );
    });

    it("should not send anything via stdin", () => {
      expect(stdinValue).toBe("");
    });

    it("should close stdin", () => {
      expect(shellStdin.readableEnded).toBe(true);
    });

    describe("when process errors", () => {
      beforeEach(() => {
        shellProcessFake.emit("error", new Error("some-error"));
      });

      it("should resolve with a failed call", async () => {
        await expect(unixShellEnv).resolves.toEqual({
          callWasSuccessful: false,
          error: `Failed to spawn ${shellPath}: ${JSON.stringify({
            error: "Error: some-error",
            stdout: "",
            stderr: "",
          }, null, 4)}`,
        });
      });
    });

    describe("when process exits with non-zero exit code", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 1, null);
      });

      it("should resolve with a failed call", async () => {
        await expect(unixShellEnv).resolves.toEqual({
          callWasSuccessful: false,
          error: 'Shell did not exit successfully: {\n    "code": 1,\n    "signal": null,\n    "stdout": "",\n    "stderr": ""\n}',
        });
      });
    });

    describe("when process exits with a signal", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 0, "SIGKILL");
      });

      it("should resolve with a failed call", async () => {
        await expect(unixShellEnv).resolves.toEqual({
          callWasSuccessful: false,
          error: 'Shell did not exit successfully: {\n    "code": 0,\n    "signal": "SIGKILL",\n    "stdout": "",\n    "stderr": ""\n}',
        });
      });
    });

    describe("when process stdout emits some data", () => {
      beforeEach(() => {
        const fakeInnerEnv = {
          PATH: "/bin",
          ...expectedEnv,
        };

        shellStdout.emit("data", Buffer.from(`some-other-datadeadfoobarfoobeef${JSON.stringify(fakeInnerEnv)}deadfoobarfoobeefsome-third-other-data`));
      });

      describe("when process successfully exits", () => {
        beforeEach(() => {
          shellProcessFake.emit("close", 0);
        });

        it("should resolve the env", async () => {
          await expect(unixShellEnv).resolves.toEqual({
            callWasSuccessful: true,
            response: {
              PATH: "/bin",
              SOME_ENV_VAR: "some-env-value",
              TERM: "some-other-value",
              SOME_THIRD_NON_UNDEFINED_VALUE: "",
            },
          });
        });
      });
    });
  });

  describe.each([
    "/usr/local/bin/pwsh",
    "/usr/local/bin/pwsh-preview",
  ])("when shell is %s", (shellPath) => {
    beforeEach(async () => {
      const controller = new AbortController();

      unixShellEnv = computeUnixShellEnvironment(shellPath, { signal: controller.signal });
      await flushPromises();
    });

    it("should spawn a process with the correct arguments", () => {
      expect(spawnMock).toBeCalledWith(
        shellPath,
        [
          "-Login",
        ],
        expect.objectContaining({
          env: expectedEnv,
        }),
      );
    });

    it("should send the command via stdin", () => {
      expect(stdinValue).toBe(`Command '/some/process/exec/path' -p '\\"deadfoobarfoobeef\\" + JSON.stringify(process.env) + \\"deadfoobarfoobeef\\"'`);
    });

    it("should close stdin", () => {
      expect(shellStdin.readableEnded).toBe(true);
    });

    describe("when process errors", () => {
      beforeEach(() => {
        shellProcessFake.emit("error", new Error("some-error"));
      });

      it("should resolve with a failed call", async () => {
        await expect(unixShellEnv).resolves.toEqual({
          callWasSuccessful: false,
          error: `Failed to spawn ${shellPath}: ${JSON.stringify({
            error: "Error: some-error",
            stdout: "",
            stderr: "",
          }, null, 4)}`,
        });
      });
    });

    describe("when process exits with non-zero exit code", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 1, null);
      });

      it("should resolve with a failed call", async () => {
        await expect(unixShellEnv).resolves.toEqual({
          callWasSuccessful: false,
          error: 'Shell did not exit successfully: {\n    "code": 1,\n    "signal": null,\n    "stdout": "",\n    "stderr": ""\n}',
        });
      });
    });

    describe("when process exits with a signal", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 0, "SIGKILL");
      });

      it("should resolve with a failed call", async () => {
        await expect(unixShellEnv).resolves.toEqual({
          callWasSuccessful: false,
          error: 'Shell did not exit successfully: {\n    "code": 0,\n    "signal": "SIGKILL",\n    "stdout": "",\n    "stderr": ""\n}',
        });
      });
    });

    describe("when process stdout emits some data", () => {
      beforeEach(() => {
        const fakeInnerEnv = {
          PATH: "/bin",
          ...expectedEnv,
        };

        shellStdout.emit("data", Buffer.from(`some-other-datadeadfoobarfoobeef${JSON.stringify(fakeInnerEnv)}deadfoobarfoobeefsome-third-other-data`));
      });

      describe("when process successfully exits", () => {
        beforeEach(() => {
          shellProcessFake.emit("close", 0);
        });

        it("should resolve the env", async () => {
          await expect(unixShellEnv).resolves.toEqual({
            callWasSuccessful: true,
            response: {
              PATH: "/bin",
              SOME_ENV_VAR: "some-env-value",
              TERM: "some-other-value",
              SOME_THIRD_NON_UNDEFINED_VALUE: "",
            },
          });
        });
      });
    });
  });
});
