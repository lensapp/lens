/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
import type { DeepMockProxy } from "jest-mock-extended";
import { mockDeep, mock } from "jest-mock-extended";
import { waitUntilUsed } from "tcp-port-used";
import type { Readable } from "stream";
import { EventEmitter } from "stream";
import { Console } from "console";
import { stdout, stderr } from "process";
import mockFs from "mock-fs";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import createKubeAuthProxyInjectable from "../kube-auth-proxy/create-kube-auth-proxy.injectable";
import type { CreateCluster } from "../../common/cluster/create-cluster-injection-token";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";
import path from "path";
import spawnInjectable from "../child-process/spawn.injectable";
import getConfigurationFileModelInjectable from "../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForTempInjectable from "../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import normalizedPlatformInjectable from "../../common/vars/normalized-platform.injectable";
import kubectlBinaryNameInjectable from "../kubectl/binary-name.injectable";
import kubectlDownloadingNormalizedArchInjectable from "../kubectl/normalized-arch.injectable";

console = new Console(stdout, stderr);

const mockBroadcastIpc = broadcastMessage as jest.MockedFunction<typeof broadcastMessage>;
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
const mockWaitUntilUsed = waitUntilUsed as jest.MockedFunction<typeof waitUntilUsed>;
const clusterServerUrl = "https://192.168.64.3:8443";

describe("kube auth proxy tests", () => {
  let createCluster: CreateCluster;
  let createKubeAuthProxy: (cluster: Cluster, environmentVariables: NodeJS.ProcessEnv) => KubeAuthProxy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockMinikubeConfig = {
      "minikube-config.yml": JSON.stringify({
        apiVersion: "v1",
        clusters: [{
          name: "minikube",
          cluster: {
            server: clusterServerUrl,
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

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(directoryForTempInjectable, () => "some-directory-for-temp");

    di.override(spawnInjectable, () => mockSpawn);
    di.override(kubectlBinaryNameInjectable, () => "kubectl");
    di.override(kubectlDownloadingNormalizedArchInjectable, () => "amd64");
    di.override(normalizedPlatformInjectable, () => "darwin");

    di.permitSideEffects(getConfigurationFileModelInjectable);

    mockFs(mockMinikubeConfig);

    createCluster = di.inject(createClusterInjectionToken);

    createKubeAuthProxy = di.inject(createKubeAuthProxyInjectable);
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("calling exit multiple times shouldn't throw", async () => {
    const cluster = createCluster({
      id: "foobar",
      kubeConfigPath: "minikube-config.yml",
      contextName: "minikube",
    }, {
      clusterServerUrl,
    });

    const kap = createKubeAuthProxy(cluster, {});

    kap.exit();
    kap.exit();
    kap.exit();
  });

  describe("spawn tests", () => {
    let mockedCP: DeepMockProxy<ChildProcess>;
    let listeners: EventEmitter;
    let proxy: KubeAuthProxy;

    beforeEach(async () => {
      mockedCP = mockDeep<ChildProcess>();
      listeners = new EventEmitter();
      const stderr = mockedCP.stderr = mock<Readable>();
      const stdout = mockedCP.stdout = mock<Readable>();

      jest.spyOn(Kubectl.prototype, "checkBinary").mockReturnValueOnce(Promise.resolve(true));
      jest.spyOn(Kubectl.prototype, "ensureKubectl").mockReturnValueOnce(Promise.resolve(false));
      mockedCP.on.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): ChildProcess => {
        listeners.on(event, listener);

        return mockedCP;
      });
      mockedCP.stderr.on.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.on(`stderr/${String(event)}`, listener);

        return stderr;
      });
      mockedCP.stderr.off.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.off(`stderr/${String(event)}`, listener);

        return stderr;
      });
      mockedCP.stderr.removeListener.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.off(`stderr/${String(event)}`, listener);

        return stderr;
      });
      mockedCP.stderr.once.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.once(`stderr/${String(event)}`, listener);

        return stderr;
      });
      mockedCP.stderr.removeAllListeners.mockImplementation((event?: string | symbol): Readable => {
        listeners.removeAllListeners(event ?? `stderr/${String(event)}`);

        return stderr;
      });
      mockedCP.stdout.on.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.on(`stdout/${String(event)}`, listener);

        if (event === "data") {
          listeners.emit("stdout/data", "Starting to serve on 127.0.0.1:9191");
        }

        return stdout;
      });
      mockedCP.stdout.once.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.once(`stdout/${String(event)}`, listener);

        return stdout;
      });
      mockedCP.stdout.off.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.off(`stdout/${String(event)}`, listener);

        return stdout;
      });
      mockedCP.stdout.removeListener.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.off(`stdout/${String(event)}`, listener);

        return stdout;
      });
      mockedCP.stdout.removeAllListeners.mockImplementation((event?: string | symbol): Readable => {
        listeners.removeAllListeners(event ?? `stdout/${String(event)}`);

        return stdout;
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
      }, {
        clusterServerUrl,
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
