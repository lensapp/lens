/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterModel } from "../../common/cluster/types";

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
    splat: jest.fn(),
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

import type { Cluster } from "../../common/cluster/cluster";
import type { KubeAuthProxy } from "../kube-auth-proxy/kube-auth-proxy";
import { broadcastMessage } from "../../common/ipc";
import type { ChildProcess } from "child_process";
import { spawn } from "child_process";
import { Kubectl } from "../kubectl/kubectl";
import type { MockProxy } from "jest-mock-extended";
import { mock } from "jest-mock-extended";
import { waitUntilUsed } from "tcp-port-used";
import type { Readable } from "stream";
import { EventEmitter } from "stream";
import { UserStore } from "../../common/user-store";
import { Console } from "console";
import { stdout, stderr } from "process";
import mockFs from "mock-fs";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import createKubeAuthProxyInjectable from "../kube-auth-proxy/create-kube-auth-proxy.injectable";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";
import path from "path";
import spawnInjectable from "../child-process/spawn.injectable";
import getConfigurationFileModelInjectable from "../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import appVersionInjectable from "../../common/get-configuration-file-model/app-version/app-version.injectable";

console = new Console(stdout, stderr);

const mockBroadcastIpc = broadcastMessage as jest.MockedFunction<typeof broadcastMessage>;
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
const mockWaitUntilUsed = waitUntilUsed as jest.MockedFunction<typeof waitUntilUsed>;

describe("kube auth proxy tests", () => {
  let createCluster: (model: ClusterModel) => Cluster;
  let createKubeAuthProxy: (cluster: Cluster, environmentVariables: NodeJS.ProcessEnv) => KubeAuthProxy;

  beforeEach(async () => {
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

    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(spawnInjectable, () => mockSpawn);

    di.permitSideEffects(getConfigurationFileModelInjectable);
    di.permitSideEffects(appVersionInjectable);

    mockFs(mockMinikubeConfig);

    await di.runSetups();

    createCluster = di.inject(createClusterInjectionToken);

    createKubeAuthProxy = di.inject(createKubeAuthProxyInjectable);

    UserStore.createInstance();
  });

  afterEach(() => {
    UserStore.resetInstance();
    mockFs.restore();
  });

  it("calling exit multiple times shouldn't throw", async () => {
    const cluster = createCluster({
      id: "foobar",
      kubeConfigPath: "minikube-config.yml",
      contextName: "minikube",
    });

    const kap = createKubeAuthProxy(cluster, {});

    kap.exit();
    kap.exit();
    kap.exit();
  });

  describe("spawn tests", () => {
    let mockedCP: MockProxy<ChildProcess>;
    let listeners: EventEmitter;
    let proxy: KubeAuthProxy;

    beforeEach(async () => {
      mockedCP = mock<ChildProcess>();
      listeners = new EventEmitter();

      jest.spyOn(Kubectl.prototype, "checkBinary").mockReturnValueOnce(Promise.resolve(true));
      jest.spyOn(Kubectl.prototype, "ensureKubectl").mockReturnValueOnce(Promise.resolve(false));
      mockedCP.on.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): ChildProcess => {
        listeners.on(event, listener);

        return mockedCP;
      });
      mockedCP.stderr = mock<Readable>();
      mockedCP.stderr.on.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.on(`stderr/${event}`, listener);

        return mockedCP.stderr;
      });
      mockedCP.stderr.off.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.off(`stderr/${event}`, listener);

        return mockedCP.stderr;
      });
      mockedCP.stderr.removeListener.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.off(`stderr/${event}`, listener);

        return mockedCP.stderr;
      });
      mockedCP.stderr.once.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.once(`stderr/${event}`, listener);

        return mockedCP.stderr;
      });
      mockedCP.stderr.removeAllListeners.mockImplementation((event?: string): Readable => {
        listeners.removeAllListeners(event ?? `stderr/${event}`);

        return mockedCP.stderr;
      });
      mockedCP.stdout = mock<Readable>();
      mockedCP.stdout.on.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.on(`stdout/${event}`, listener);

        if (event === "data") {
          listeners.emit("stdout/data", "Starting to serve on 127.0.0.1:9191");
        }

        return mockedCP.stdout;
      });
      mockedCP.stdout.once.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.once(`stdout/${event}`, listener);

        return mockedCP.stdout;
      });
      mockedCP.stdout.off.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.off(`stdout/${event}`, listener);

        return mockedCP.stdout;
      });
      mockedCP.stdout.removeListener.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.off(`stdout/${event}`, listener);

        return mockedCP.stdout;
      });
      mockedCP.stdout.removeAllListeners.mockImplementation((event?: string): Readable => {
        listeners.removeAllListeners(event ?? `stdout/${event}`);

        return mockedCP.stdout;
      });
      mockSpawn.mockImplementationOnce((command: string): ChildProcess => {
        expect(path.basename(command).split(".")[0]).toBe("lens-k8s-proxy");

        return mockedCP;
      });
      mockWaitUntilUsed.mockReturnValueOnce(Promise.resolve());

      const cluster = createCluster({
        id: "foobar",
        kubeConfigPath: "minikube-config.yml",
        contextName: "minikube",
      });

      proxy = createKubeAuthProxy(cluster, {});
    });

    it("should call spawn and broadcast errors", async () => {
      await proxy.run();
      listeners.emit("error", { message: "foobarbat" });

      expect(mockBroadcastIpc).toBeCalledWith("cluster:foobar:connection-update", { message: "foobarbat", isError: true });
    });

    it("should call spawn and broadcast exit", async () => {
      await proxy.run();
      listeners.emit("exit", 0);

      expect(mockBroadcastIpc).toBeCalledWith("cluster:foobar:connection-update", { message: "proxy exited with code: 0", isError: false });
    });

    it("should call spawn and broadcast errors from stderr", async () => {
      await proxy.run();
      listeners.emit("stderr/data", "an error");

      expect(mockBroadcastIpc).toBeCalledWith("cluster:foobar:connection-update", { message: "an error", isError: true });
    });

    it("should call spawn and broadcast stdout serving info", async () => {
      await proxy.run();

      expect(mockBroadcastIpc).toBeCalledWith("cluster:foobar:connection-update", { message: "Authentication proxy started", isError: false });
    });

    it("should call spawn and broadcast stdout other info", async () => {
      await proxy.run();
      listeners.emit("stdout/data", "some info");

      expect(mockBroadcastIpc).toBeCalledWith("cluster:foobar:connection-update", { message: "some info", isError: false });
    });
  });
});
