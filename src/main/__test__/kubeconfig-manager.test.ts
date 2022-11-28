/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import { KubeconfigManager } from "../kubeconfig-manager/kubeconfig-manager";
import type { Cluster } from "../../common/cluster/cluster";
import createKubeconfigManagerInjectable from "../kubeconfig-manager/create-kubeconfig-manager.injectable";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";
import directoryForTempInjectable from "../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import createContextHandlerInjectable from "../context-handler/create-context-handler.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { parse } from "url";
import loggerInjectable from "../../common/logger.injectable";
import type { Logger } from "../../common/logger";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import normalizedPlatformInjectable from "../../common/vars/normalized-platform.injectable";
import kubectlBinaryNameInjectable from "../kubectl/binary-name.injectable";
import kubectlDownloadingNormalizedArchInjectable from "../kubectl/normalized-arch.injectable";
import type { ReadFile } from "../../common/fs/read-file.injectable";
import readFileInjectable from "../../common/fs/read-file.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { WriteFile } from "../../common/fs/write-file.injectable";
import writeFileInjectable from "../../common/fs/write-file.injectable";
import type { PathExists } from "../../common/fs/path-exists.injectable";
import pathExistsInjectable from "../../common/fs/path-exists.injectable";
import type { DeleteFile } from "../../common/fs/delete-file.injectable";
import deleteFileInjectable from "../../common/fs/delete-file.injectable";

const clusterServerUrl = "https://192.168.64.3:8443";

describe("kubeconfig manager tests", () => {
  let clusterFake: Cluster;
  let createKubeconfigManager: (cluster: Cluster) => KubeconfigManager;
  let di: DiContainer;
  let loggerMock: jest.Mocked<Logger>;
  let readFileMock: AsyncFnMock<ReadFile>;
  let deleteFileMock: AsyncFnMock<DeleteFile>;
  let writeFileMock: AsyncFnMock<WriteFile>;
  let pathExistsMock: AsyncFnMock<PathExists>;
  let kubeConfManager: KubeconfigManager;
  let ensureServerMock: AsyncFnMock<() => Promise<void>>;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForTempInjectable, () => "/some-directory-for-temp");
    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");
    di.override(kubectlBinaryNameInjectable, () => "kubectl");
    di.override(kubectlDownloadingNormalizedArchInjectable, () => "amd64");
    di.override(normalizedPlatformInjectable, () => "darwin");

    readFileMock = asyncFn();
    di.override(readFileInjectable, () => readFileMock);
    writeFileMock = asyncFn();
    di.override(writeFileInjectable, () => writeFileMock);
    pathExistsMock = asyncFn();
    di.override(pathExistsInjectable, () => pathExistsMock);
    deleteFileMock = asyncFn();
    di.override(deleteFileInjectable, () => deleteFileMock);

    loggerMock = {
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      silly: jest.fn(),
    };

    di.override(loggerInjectable, () => loggerMock);

    ensureServerMock = asyncFn();

    di.override(createContextHandlerInjectable, () => (cluster) => ({
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

    const createCluster = di.inject(createClusterInjectionToken);

    createKubeconfigManager = di.inject(createKubeconfigManagerInjectable);

    clusterFake = createCluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "/minikube-config.yml",
    }, {
      clusterServerUrl,
    });

    jest.spyOn(KubeconfigManager.prototype, "resolveProxyUrl", "get").mockReturnValue("http://127.0.0.1:9191/foo");

    kubeConfManager = createKubeconfigManager(clusterFake);
  });

  describe("when calling clear", () => {
    it("should resolve immediately", async () => {
      await kubeConfManager.clear();
    });

    it("being called several times shouldn't throw", async () => {
      await kubeConfManager.clear();
      await kubeConfManager.clear();
      await kubeConfManager.clear();
    });
  });

  describe("when getPath() is called initially", () => {
    let getPathPromise: Promise<string>;

    beforeEach(async () => {
      getPathPromise = kubeConfManager.getPath();
    });

    it("should not call pathExists()", () => {
      expect(pathExistsMock).not.toBeCalled();
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

      describe("when reading cluster's kubeconfig resolves", () => {
        beforeEach(async () => {
          await readFileMock.resolveSpecific(
            ["/minikube-config.yml"],
            JSON.stringify({
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
            }),
          );
        });

        describe("when writing out new proxy kubeconfig resolves", () => {
          beforeEach(async () => {
            await writeFileMock.resolveSpecific(
              ["/some-directory-for-temp/kubeconfig-foo", "apiVersion: v1\nkind: Config\npreferences: {}\ncurrent-context: minikube\nclusters:\n  - name: minikube\n    cluster:\n      server: http://127.0.0.1:9191/foo\ncontexts:\n  - name: minikube\n    context:\n      cluster: minikube\n      user: proxy\nusers:\n  - name: proxy\n    user: {}\n"],
            );
          });

          it("should allow getPath to resolve with the path to the kubeconfig", async () => {
            expect(await getPathPromise).toBe("/some-directory-for-temp/kubeconfig-foo");
          });

          describe("when calling clear", () => {
            let clearPromise: Promise<void>;

            beforeEach(() => {
              clearPromise = kubeConfManager.clear();
            });

            it("should call deleteFile", () => {
              expect(deleteFileMock).toBeCalledTimes(1);
            });

            describe("when deleteFile resolves", () => {
              beforeEach(async () => {
                await deleteFileMock.resolveSpecific(
                  ["/some-directory-for-temp/kubeconfig-foo"],
                );
              });

              it("should allow clear to resolve", async () => {
                await clearPromise;
              });
            });

            describe("when deleteFile rejects with ENOENT", () => {
              beforeEach(async () => {
                await deleteFileMock.resolveSpecific(
                  ["/some-directory-for-temp/kubeconfig-foo"],
                  Promise.reject(Object.assign(new Error("file not found"), {
                    code: "ENOENT",
                  })),
                );
              });

              it("should allow clear to resolve", async () => {
                await clearPromise;
              });
            });

            it("when deleteFile rejects with some other error; clear should also reject", async () => {
              const expectPromise = expect(clearPromise).rejects.toBeDefined();

              await deleteFileMock.reject(new Error("some other error"));
              await expectPromise;
            });
          });

          describe("when calling getPath a second time", () => {
            let getPathPromise: Promise<string>;

            beforeEach(async () => {
              getPathPromise = kubeConfManager.getPath();
            });

            it("should call pathExists", () => {
              expect(pathExistsMock).toBeCalledTimes(1);
            });

            describe("when pathExists resoves to true", () => {
              beforeEach(async () => {
                await pathExistsMock.resolveSpecific(
                  ["/some-directory-for-temp/kubeconfig-foo"],
                  true,
                );
              });

              it("always getPath to resolve with path", async () => {
                expect(await getPathPromise).toBe("/some-directory-for-temp/kubeconfig-foo");
              });
            });

            describe("when pathExists resoves to false", () => {
              beforeEach(async () => {
                await pathExistsMock.resolveSpecific(
                  ["/some-directory-for-temp/kubeconfig-foo"],
                  false,
                );
              });

              it("should call ensureServer on the cluster context", () => {
                expect(ensureServerMock).toBeCalledTimes(1);
              });

              describe("when ensureServer resolves", () => {
                beforeEach(async () => {
                  await ensureServerMock.resolve();
                });

                describe("when reading cluster's kubeconfig resolves", () => {
                  beforeEach(async () => {
                    await readFileMock.resolveSpecific(
                      ["/minikube-config.yml"],
                      JSON.stringify({
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
                      }),
                    );
                  });

                  describe("when writing out new proxy kubeconfig resolves", () => {
                    beforeEach(async () => {
                      await writeFileMock.resolveSpecific(
                        ["/some-directory-for-temp/kubeconfig-foo", "apiVersion: v1\nkind: Config\npreferences: {}\ncurrent-context: minikube\nclusters:\n  - name: minikube\n    cluster:\n      server: http://127.0.0.1:9191/foo\ncontexts:\n  - name: minikube\n    context:\n      cluster: minikube\n      user: proxy\nusers:\n  - name: proxy\n    user: {}\n"],
                      );
                    });

                    it("should allow getPath to resolve with the path to the kubeconfig", async () => {
                      expect(await getPathPromise).toBe("/some-directory-for-temp/kubeconfig-foo");
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
