/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeconfigManager } from "../../../main/kubeconfig-manager/kubeconfig-manager";
import createKubeconfigManagerInjectable from "../../../main/kubeconfig-manager/create-kubeconfig-manager.injectable";
import { createClusterInjectionToken } from "../../../common/cluster/create-cluster-injection-token";
import createContextHandlerInjectable from "../../../main/context-handler/create-context-handler.injectable";
import { parse } from "url";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import writeJsonFileInjectable from "../../../common/fs/write-json-file.injectable";
import pathExistsInjectable from "../../../common/fs/path-exists.injectable";
import removePathInjectable from "../../../common/fs/remove.injectable";

const kubeConfigPath = "/minikube-config.yml";
const clusterServerUrl = "https://192.168.64.3:8443";

describe("kubeconfig manager technical tests", () => {
  let builder: ApplicationBuilder;
  let ensureServerMock: AsyncFnMock<() => Promise<void>>;
  let kubeconfigManager: KubeconfigManager;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    ensureServerMock = asyncFn();

    builder.mainDi.override(createContextHandlerInjectable, () => (cluster) => ({
      restartServer: jest.fn(),
      stopServer: jest.fn(),
      clusterUrl: parse(cluster.apiUrl),
      getApiTarget: jest.fn(),
      getPrometheusDetails: jest.fn(),
      resolveAuthProxyCa: jest.fn(),
      resolveAuthProxyUrl: jest.fn(),
      setupPrometheus: jest.fn(),
      ensureServer: ensureServerMock,
    }));

    await builder.render();

    const writeJsonFile = builder.mainDi.inject(writeJsonFileInjectable);

    await writeJsonFile(kubeConfigPath, {
      apiVersion: "v1",
      clusters: [{
        name: "minikube",
        cluster: {
          server: clusterServerUrl,
        },
      }],
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

    const createCluster = builder.mainDi.inject(createClusterInjectionToken);
    const createKubeconfigManager = builder.mainDi.inject(createKubeconfigManagerInjectable);

    const clusterFake = createCluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath,
    }, {
      clusterServerUrl,
    });

    kubeconfigManager = createKubeconfigManager(clusterFake);
  });

  describe("when calling clear", () => {
    it("should resolve immediately", async () => {
      await kubeconfigManager.clear();
    });

    it("being called several times shouldn't throw", async () => {
      await kubeconfigManager.clear();
      await kubeconfigManager.clear();
      await kubeconfigManager.clear();
    });
  });

  describe("when getPath() is called initially", () => {
    let getPathPromise: Promise<string>;

    beforeEach(async () => {
      getPathPromise = kubeconfigManager.getPath();
    });

    it("should call ensureServer on the cluster context", () => {
      expect(ensureServerMock).toBeCalledTimes(1);
    });

    describe("when ensureServer resolves", () => {
      beforeEach(async () => {
        await ensureServerMock.resolve();

        // clear state of calls
        ensureServerMock.mock.calls.length = 0;
      });

      it("should allow getPath to resolve with the path to the kubeconfig", async () => {
        expect(await getPathPromise).toBe("/some-directory-for-temp/kubeconfig-foo");
      });

      it("when calling clear, should remove file from filesystem", async () => {
        const pathExists = builder.mainDi.inject(pathExistsInjectable);

        await kubeconfigManager.clear();

        expect(await pathExists("/some-directory-for-temp/kubeconfig-foo")).toBe(false);
      });

      it("when calling getPath a second time, should resolve with same path", async () => {
        expect(await getPathPromise).toBe("/some-directory-for-temp/kubeconfig-foo");
      });

      describe("if file is removed, and getPath is called agin", () => {
        let getPathPromise2: Promise<string>;

        beforeEach(async () => {
          const removePath = builder.mainDi.inject(removePathInjectable);

          await removePath("/some-directory-for-temp/kubeconfig-foo");

          getPathPromise2 = kubeconfigManager.getPath();
        });

        it("should call ensureServer on the cluster context", () => {
          expect(ensureServerMock).toBeCalledTimes(1);
        });

        describe("when ensureServer resolves", () => {
          beforeEach(async () => {
            await ensureServerMock.resolve();
          });

          it("should allow getPath to resolve with the path to the kubeconfig", async () => {
            expect(await getPathPromise2).toBe("/some-directory-for-temp/kubeconfig-foo");
          });
        });
      });
    });
  });
});
