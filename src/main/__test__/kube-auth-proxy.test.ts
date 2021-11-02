/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

jest.mock("winston", () => ({
  format: {
    colorize: jest.fn(),
    combine: jest.fn(),
    simple: jest.fn(),
    label: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    padLevels: jest.fn(),
    ms: jest.fn(),
  },
  createLogger: jest.fn().mockReturnValue({
    silly: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    crit: jest.fn(),
  }),
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

jest.mock("../../common/ipc");
jest.mock("child_process");
jest.mock("tcp-port-used");

import { Cluster } from "../cluster";
import { KubeAuthProxy } from "../kube-auth-proxy";
import { broadcastMessage } from "../../common/ipc";
import { ChildProcess, spawn } from "child_process";
import { bundledKubectlPath, Kubectl } from "../kubectl";
import { mock, MockProxy } from "jest-mock-extended";
import { waitUntilUsed } from "tcp-port-used";
import type { Readable } from "stream";
import { UserStore } from "../../common/user-store";
import { Console } from "console";
import { stdout, stderr } from "process";
import mockFs from "mock-fs";
import { AppPaths } from "../../common/app-paths";

console = new Console(stdout, stderr);

const mockBroadcastIpc = broadcastMessage as jest.MockedFunction<typeof broadcastMessage>;
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
const mockWaitUntilUsed = waitUntilUsed as jest.MockedFunction<typeof waitUntilUsed>;

jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));
AppPaths.init();

describe("kube auth proxy tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const mockMinikubeConfig = {
      "minikube-config.yml": JSON.stringify({
        apiVersion: "v1",
        clusters: [{
          name: "minikube",
          cluster: {
            server: "https://192.168.64.3:8443",
          },
        }],
        "current-context": "minikube",
        contexts: [{
          context: {
            cluster: "minikube",
            user: "minikube",
          },
          name: "minikube",
        }],
        users: [{
          name: "minikube",
        }],
        kind: "Config",
        preferences: {},
      }),
      "tmp": {},
    };

    mockFs(mockMinikubeConfig);
    UserStore.createInstance();
  });

  afterEach(() => {
    UserStore.resetInstance();
    mockFs.restore();
  });

  it("calling exit multiple times shouldn't throw", async () => {
    const kap = new KubeAuthProxy(new Cluster({ id: "foobar", kubeConfigPath: "minikube-config.yml", contextName: "minikube" }), {});

    kap.exit();
    kap.exit();
    kap.exit();
  });

  describe("spawn tests", () => {
    let mockedCP: MockProxy<ChildProcess>;
    let listeners: Record<string, (...args: any[]) => void>;
    let proxy: KubeAuthProxy;

    beforeEach(async () => {
      mockedCP = mock<ChildProcess>();
      listeners = {};

      jest.spyOn(Kubectl.prototype, "checkBinary").mockReturnValueOnce(Promise.resolve(true));
      jest.spyOn(Kubectl.prototype, "ensureKubectl").mockReturnValueOnce(Promise.resolve(false));
      mockedCP.on.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): ChildProcess => {
        listeners[event] = listener;

        return mockedCP;
      });
      mockedCP.stderr = mock<Readable>();
      mockedCP.stderr.on.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners[`stderr/${event}`] = listener;

        return mockedCP.stderr;
      });
      mockedCP.stdout = mock<Readable>();
      mockedCP.stdout.on.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners[`stdout/${event}`] = listener;
        listeners[`stdout/${event}`]("Starting to serve on 127.0.0.1:9191");

        return mockedCP.stdout;
      });
      mockSpawn.mockImplementationOnce((command: string): ChildProcess => {
        expect(command).toBe(bundledKubectlPath());

        return mockedCP;
      });
      mockWaitUntilUsed.mockReturnValueOnce(Promise.resolve());

      const cluster = new Cluster({ id: "foobar", kubeConfigPath: "minikube-config.yml", contextName: "minikube" });

      proxy = new KubeAuthProxy(cluster, {});
    });

    it("should call spawn and broadcast errors", async () => {
      await proxy.run();
      listeners["error"]({ message: "foobarbat" });

      expect(mockBroadcastIpc).toBeCalledWith("kube-auth:foobar", { data: "foobarbat", error: true });
    });

    it("should call spawn and broadcast exit", async () => {
      await proxy.run();
      listeners["exit"](0);

      expect(mockBroadcastIpc).toBeCalledWith("kube-auth:foobar", { data: "proxy exited with code: 0", error: false });
    });

    it("should call spawn and broadcast errors from stderr", async () => {
      await proxy.run();
      listeners["stderr/data"]("an error");

      expect(mockBroadcastIpc).toBeCalledWith("kube-auth:foobar", { data: "an error", error: true });
    });

    it("should call spawn and broadcast stdout serving info", async () => {
      await proxy.run();

      expect(mockBroadcastIpc).toBeCalledWith("kube-auth:foobar", { data: "Authentication proxy started\n" });
    });

    it("should call spawn and broadcast stdout other info", async () => {
      await proxy.run();
      listeners["stdout/data"]("some info");

      expect(mockBroadcastIpc).toBeCalledWith("kube-auth:foobar", { data: "some info" });
    });
  });
});
