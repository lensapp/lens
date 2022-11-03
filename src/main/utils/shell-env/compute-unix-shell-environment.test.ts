/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { ChildProcessWithoutNullStreams } from "child_process";
import EventEmitter from "events";
import { flushPromises } from "../../../common/test-utils/flush-promises";
import type { Spawn } from "../../child-process/spawn.injectable";
import spawnInjectable from "../../child-process/spawn.injectable";
import randomUUIDInjectable from "../../crypto/random-uuid.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { ComputeUnixShellEnvironment } from "./compute-unix-shell-environment.injectable";
import computeUnixShellEnvironmentInjectable from "./compute-unix-shell-environment.injectable";
import processEnvInjectable from "./env.injectable";
import processExecPathInjectable from "./execPath.injectable";
import MemoryStream from "memorystream";
import type { EnvironmentVariables } from "./compute-shell-environment.injectable";

const expectedEnv = {
  SOME_ENV_VAR: "some-env-value",
  ELECTRON_RUN_AS_NODE: "1",
  ELECTRON_NO_ATTACH_CONSOLE: "1",
  TERM: "screen-256color-bce",
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
  let unixShellEnv: Promise<EnvironmentVariables>;

  beforeEach(() => {
    di = getDiForUnitTesting({
      doGeneralOverrides: true,
    });

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
    di.override(randomUUIDInjectable, () => () => "deadbeef");

    di.override(processEnvInjectable, () => ({
      SOME_ENV_VAR: "some-env-value",
      TERM: "some-other-value",
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
      unixShellEnv = computeUnixShellEnvironment(shellPath, { signal: new AbortSignal() });
      await flushPromises();
    });

    it("should spawn a process with the correct arguments", () => {
      expect(spawnMock).toBeCalledWith(
        shellPath,
        [
          "-l",
        ],
        {
          env: expectedEnv,
        },
      );
    });

    it("should send the command via stdin", () => {
      expect(stdinValue).toBe(`'/some/process/exec/path' -p '"deadbeef" + JSON.stringify(process.env) + "deadbeef"'`);
    });

    it("should close stdin", () => {
      expect(shellStdin.readableEnded).toBe(true);
    });

    describe("when process errors", () => {
      beforeEach(() => {
        shellProcessFake.emit("error", new Error("some-error"));
      });

      it("should reject the promise with the error", async () => {
        await expect(unixShellEnv).rejects.toThrow("some-error");
      });
    });

    describe("when process exits with non-zero exit code", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 1, null);
      });

      it("should reject the promise with the error", async () => {
        await expect(unixShellEnv).rejects.toThrow("Unexpected return code from spawned shell (code: 1, signal: null)");
      });
    });

    describe("when process exits with a signal", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 0, "SIGKILL");
      });

      it("should reject the promise with the error", async () => {
        await expect(unixShellEnv).rejects.toThrow("Unexpected return code from spawned shell (code: 0, signal: SIGKILL)");
      });
    });

    describe("when process stdout emits some data", () => {
      beforeEach(() => {
        const fakeInnerEnv = {
          PATH: "/bin",
          ...expectedEnv,
        };

        shellStdout.emit("data", Buffer.from(`some-other-datadeadbeef${JSON.stringify(fakeInnerEnv)}deadbeefsome-third-other-data`));
      });

      describe("when process successfully exits", () => {
        beforeEach(() => {
          shellProcessFake.emit("close", 0);
        });

        it("should resolve the env", async () => {
          await expect(unixShellEnv).resolves.toMatchObject({
            PATH: "/bin",
            SOME_ENV_VAR: "some-env-value",
            TERM: "some-other-value",
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
      unixShellEnv = computeUnixShellEnvironment(shellPath, { signal: new AbortSignal() });
      await flushPromises();
    });

    it("should spawn a process with the correct arguments", () => {
      expect(spawnMock).toBeCalledWith(
        shellPath,
        [
          "-l",
          "-i",
        ],
        {
          env: expectedEnv,
        },
      );
    });

    it("should send the command via stdin", () => {
      expect(stdinValue).toBe(`'/some/process/exec/path' -p '"deadbeef" + JSON.stringify(process.env) + "deadbeef"'`);
    });

    it("should close stdin", () => {
      expect(shellStdin.readableEnded).toBe(true);
    });

    describe("when process errors", () => {
      beforeEach(() => {
        shellProcessFake.emit("error", new Error("some-error"));
      });

      it("should reject the promise with the error", async () => {
        await expect(unixShellEnv).rejects.toThrow("some-error");
      });
    });

    describe("when process exits with non-zero exit code", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 1, null);
      });

      it("should reject the promise with the error", async () => {
        await expect(unixShellEnv).rejects.toThrow("Unexpected return code from spawned shell (code: 1, signal: null)");
      });
    });

    describe("when process exits with a signal", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 0, "SIGKILL");
      });

      it("should reject the promise with the error", async () => {
        await expect(unixShellEnv).rejects.toThrow("Unexpected return code from spawned shell (code: 0, signal: SIGKILL)");
      });
    });

    describe("when process stdout emits some data", () => {
      beforeEach(() => {
        const fakeInnerEnv = {
          PATH: "/bin",
          ...expectedEnv,
        };

        shellStdout.emit("data", Buffer.from(`some-other-datadeadbeef${JSON.stringify(fakeInnerEnv)}deadbeefsome-third-other-data`));
      });

      describe("when process successfully exits", () => {
        beforeEach(() => {
          shellProcessFake.emit("close", 0);
        });

        it("should resolve the env", async () => {
          await expect(unixShellEnv).resolves.toMatchObject({
            PATH: "/bin",
            SOME_ENV_VAR: "some-env-value",
            TERM: "some-other-value",
          });
        });
      });
    });
  });

  describe.each([
    "/usr/local/bin/fish",
  ])("when shell is %s", (shellPath) => {
    beforeEach(async () => {
      unixShellEnv = computeUnixShellEnvironment(shellPath, { signal: new AbortSignal() });
      await flushPromises();
    });

    it("should spawn a process with the correct arguments", () => {
      expect(spawnMock).toBeCalledWith(
        shellPath,
        [
          "-l",
          "-c",
          `'/some/process/exec/path' -p '"deadbeef" + JSON.stringify(process.env) + "deadbeef"'`,
        ],
        {
          env: expectedEnv,
        },
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

      it("should reject the promise with the error", async () => {
        await expect(unixShellEnv).rejects.toThrow("some-error");
      });
    });

    describe("when process exits with non-zero exit code", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 1, null);
      });

      it("should reject the promise with the error", async () => {
        await expect(unixShellEnv).rejects.toThrow("Unexpected return code from spawned shell (code: 1, signal: null)");
      });
    });

    describe("when process exits with a signal", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 0, "SIGKILL");
      });

      it("should reject the promise with the error", async () => {
        await expect(unixShellEnv).rejects.toThrow("Unexpected return code from spawned shell (code: 0, signal: SIGKILL)");
      });
    });

    describe("when process stdout emits some data", () => {
      beforeEach(() => {
        const fakeInnerEnv = {
          PATH: "/bin",
          ...expectedEnv,
        };

        shellStdout.emit("data", Buffer.from(`some-other-datadeadbeef${JSON.stringify(fakeInnerEnv)}deadbeefsome-third-other-data`));
      });

      describe("when process successfully exits", () => {
        beforeEach(() => {
          shellProcessFake.emit("close", 0);
        });

        it("should resolve the env", async () => {
          await expect(unixShellEnv).resolves.toMatchObject({
            PATH: "/bin",
            SOME_ENV_VAR: "some-env-value",
            TERM: "some-other-value",
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
      unixShellEnv = computeUnixShellEnvironment(shellPath, { signal: new AbortSignal() });
      await flushPromises();
    });

    it("should spawn a process with the correct arguments", () => {
      expect(spawnMock).toBeCalledWith(
        shellPath,
        [
          "-Login",
        ],
        {
          env: expectedEnv,
        },
      );
    });

    it("should send the command via stdin", () => {
      expect(stdinValue).toBe(`Command '/some/process/exec/path' -p '\\"deadbeef\\" + JSON.stringify(process.env) + \\"deadbeef\\"'`);
    });

    it("should close stdin", () => {
      expect(shellStdin.readableEnded).toBe(true);
    });

    describe("when process errors", () => {
      beforeEach(() => {
        shellProcessFake.emit("error", new Error("some-error"));
      });

      it("should reject the promise with the error", async () => {
        await expect(unixShellEnv).rejects.toThrow("some-error");
      });
    });

    describe("when process exits with non-zero exit code", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 1, null);
      });

      it("should reject the promise with the error", async () => {
        await expect(unixShellEnv).rejects.toThrow("Unexpected return code from spawned shell (code: 1, signal: null)");
      });
    });

    describe("when process exits with a signal", () => {
      beforeEach(() => {
        shellProcessFake.emit("close", 0, "SIGKILL");
      });

      it("should reject the promise with the error", async () => {
        await expect(unixShellEnv).rejects.toThrow("Unexpected return code from spawned shell (code: 0, signal: SIGKILL)");
      });
    });

    describe("when process stdout emits some data", () => {
      beforeEach(() => {
        const fakeInnerEnv = {
          PATH: "/bin",
          ...expectedEnv,
        };

        shellStdout.emit("data", Buffer.from(`some-other-datadeadbeef${JSON.stringify(fakeInnerEnv)}deadbeefsome-third-other-data`));
      });

      describe("when process successfully exits", () => {
        beforeEach(() => {
          shellProcessFake.emit("close", 0);
        });

        it("should resolve the env", async () => {
          await expect(unixShellEnv).resolves.toMatchObject({
            PATH: "/bin",
            SOME_ENV_VAR: "some-env-value",
            TERM: "some-other-value",
          });
        });
      });
    });
  });
});
