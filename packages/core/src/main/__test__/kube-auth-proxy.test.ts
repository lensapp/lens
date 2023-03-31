/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ChildProcess } from "child_process";
import { Kubectl } from "../kubectl/kubectl";
import type { DeepMockProxy } from "jest-mock-extended";
import { mockDeep, mock } from "jest-mock-extended";
import type { Readable } from "stream";
import { EventEmitter } from "stream";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import type { KubeAuthProxy } from "../kube-auth-proxy/create-kube-auth-proxy.injectable";
import createKubeAuthProxyInjectable from "../kube-auth-proxy/create-kube-auth-proxy.injectable";
import spawnInjectable from "../child-process/spawn.injectable";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForTempInjectable from "../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import normalizedPlatformInjectable from "../../common/vars/normalized-platform.injectable";
import kubectlBinaryNameInjectable from "../kubectl/binary-name.injectable";
import kubectlDownloadingNormalizedArchInjectable from "../kubectl/normalized-arch.injectable";
import broadcastMessageInjectable from "../../common/ipc/broadcast-message.injectable";
import writeJsonSyncInjectable from "../../common/fs/write-json-sync.injectable";
import ensureDirInjectable from "../../common/fs/ensure-dir.injectable";
import type { GetBasenameOfPath } from "../../common/path/get-basename.injectable";
import getBasenameOfPathInjectable from "../../common/path/get-basename.injectable";
import type { Cluster } from "../../common/cluster/cluster";
import waitUntilPortIsUsedInjectable from "../kube-auth-proxy/wait-until-port-is-used/wait-until-port-is-used.injectable";
import addClusterInjectable from "../../features/cluster/storage/common/add.injectable";

describe("kube auth proxy tests", () => {
  let spawnMock: jest.Mock;
  let waitUntilPortIsUsedMock: jest.Mock;
  let broadcastMessageMock: jest.Mock;
  let getBasenameOfPath: GetBasenameOfPath;
  let cluster: Cluster;
  let kubeAuthProxy: KubeAuthProxy;

  beforeEach(async () => {
    const di = getDiForUnitTesting();

    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");
    di.override(directoryForTempInjectable, () => "/some-directory-for-temp");

    const writeJsonSync = di.inject(writeJsonSyncInjectable);
    const ensureDir = di.inject(ensureDirInjectable);

    getBasenameOfPath = di.inject(getBasenameOfPathInjectable);

    writeJsonSync("/minikube-config.yml", {
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
    });
    await ensureDir("/tmp");

    spawnMock = jest.fn();
    di.override(spawnInjectable, () => spawnMock);

    waitUntilPortIsUsedMock = jest.fn();
    di.override(waitUntilPortIsUsedInjectable, () => waitUntilPortIsUsedMock);

    broadcastMessageMock = jest.fn();
    di.override(broadcastMessageInjectable, () => broadcastMessageMock);

    di.override(kubectlBinaryNameInjectable, () => "kubectl");
    di.override(kubectlDownloadingNormalizedArchInjectable, () => "amd64");
    di.override(normalizedPlatformInjectable, () => "darwin");

    const addCluster = di.inject(addClusterInjectable);

    cluster = addCluster({
      id: "foobar",
      kubeConfigPath: "/minikube-config.yml",
      contextName: "minikube",
    });
    kubeAuthProxy = di.inject(createKubeAuthProxyInjectable, cluster)({});
  });

  it("calling exit multiple times shouldn't throw", async () => {
    kubeAuthProxy.exit();
    kubeAuthProxy.exit();
    kubeAuthProxy.exit();
  });

  describe("spawn tests", () => {
    let mockedCP: DeepMockProxy<ChildProcess>;
    let listeners: EventEmitter;

    beforeEach(async () => {
      mockedCP = mockDeep<ChildProcess>();
      listeners = new EventEmitter();
      const stderr = mock<Readable>();
      const stdout = mock<Readable>();

      mockedCP.stderr = stderr as any;
      mockedCP.stdout = stdout as any;

      jest.spyOn(Kubectl.prototype, "checkBinary").mockReturnValueOnce(Promise.resolve(true));
      jest.spyOn(Kubectl.prototype, "ensureKubectl").mockReturnValueOnce(Promise.resolve(false));
      mockedCP.on.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): ChildProcess => {
        listeners.on(event, listener);

        return mockedCP;
      });
      stderr.on.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.on(`stderr/${String(event)}`, listener);

        return stderr;
      });
      stderr.off.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.off(`stderr/${String(event)}`, listener);

        return stderr;
      });
      stderr.removeListener.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.off(`stderr/${String(event)}`, listener);

        return stderr;
      });
      stderr.once.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.once(`stderr/${String(event)}`, listener);

        return stderr;
      });
      stderr.removeAllListeners.mockImplementation((event?: string | symbol): Readable => {
        listeners.removeAllListeners(event ?? `stderr/${String(event)}`);

        return stderr;
      });
      stdout.on.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.on(`stdout/${String(event)}`, listener);

        if (event === "data") {
          listeners.emit("stdout/data", "Starting to serve on 127.0.0.1:9191");
        }

        return stdout;
      });
      stdout.once.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.once(`stdout/${String(event)}`, listener);

        return stdout;
      });
      stdout.off.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.off(`stdout/${String(event)}`, listener);

        return stdout;
      });
      stdout.removeListener.mockImplementation((event: string | symbol, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners.off(`stdout/${String(event)}`, listener);

        return stdout;
      });
      stdout.removeAllListeners.mockImplementation((event?: string | symbol): Readable => {
        listeners.removeAllListeners(event ?? `stdout/${String(event)}`);

        return stdout;
      });
      spawnMock.mockImplementationOnce((command: string): ChildProcess => {
        expect(getBasenameOfPath(command).split(".")[0]).toBe("lens-k8s-proxy");

        return mockedCP;
      });
      waitUntilPortIsUsedMock.mockReturnValueOnce(Promise.resolve());

      await kubeAuthProxy.run();
    });

    it("should call spawn and broadcast errors", () => {
      listeners.emit("error", { message: "foobarbat" });

      expect(broadcastMessageMock).toBeCalledWith("cluster:foobar:connection-update", { message: "foobarbat", level: "error" });
    });

    it("should call spawn and broadcast exit as error when exitCode != 0", () => {
      listeners.emit("exit", 1);

      expect(broadcastMessageMock).toBeCalledWith("cluster:foobar:connection-update", { message: "proxy exited with code: 1", level: "error" });
    });

    it("should call spawn and broadcast exit as info when exitCode == 0", () => {
      listeners.emit("exit", 0);

      expect(broadcastMessageMock).toBeCalledWith("cluster:foobar:connection-update", { message: "proxy exited successfully", level: "info" });
    });

    it("should call spawn and broadcast errors from stderr", () => {
      listeners.emit("stderr/data", "an error");

      expect(broadcastMessageMock).toBeCalledWith("cluster:foobar:connection-update", { message: "an error", level: "error" });
    });

    it("should call spawn and broadcast stdout serving info", () => {
      expect(broadcastMessageMock).toBeCalledWith("cluster:foobar:connection-update", { message: "Authentication proxy started", level: "info" });
    });

    it("should call spawn and broadcast stdout other info", () => {
      listeners.emit("stdout/data", "some info");

      expect(broadcastMessageMock).toBeCalledWith("cluster:foobar:connection-update", { message: "some info", level: "info" });
    });
  });
});
