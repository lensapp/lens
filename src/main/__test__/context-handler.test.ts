/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterContextHandler, PrometheusDetails } from "../context-handler/context-handler";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import createContextHandlerInjectable from "../context-handler/create-context-handler.injectable";
import type { Cluster } from "../../common/cluster/cluster";
import createKubeAuthProxyInjectable from "../kube-auth-proxy/create-kube-auth-proxy.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { PrometheusProvider } from "../prometheus/provider";
import { prometheusProviderInjectionToken } from "../prometheus/provider";
import { runInAction } from "mobx";
import createClusterInjectable from "../create-cluster/create-cluster.injectable";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForTempInjectable from "../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import type { KubeAuthProxy } from "../kube-auth-proxy/kube-auth-proxy";
import createKubeconfigManagerInjectable from "../kubeconfig-manager/create-kubeconfig-manager.injectable";
import type { KubeconfigManager } from "../kubeconfig-manager/kubeconfig-manager";
import type { AsyncFnMock } from "@async-fn/jest";
import type { ReadFile } from "../../common/fs/read-file.injectable";
import asyncFn from "@async-fn/jest";
import readFileInjectable from "../../common/fs/read-file.injectable";
import jsyaml from "js-yaml";
import type { AsyncResult } from "../../common/utils/async-result";
import assert from "assert";

enum ServiceResult {
  Success,
  Failure,
}

const createTestPrometheusProvider = (kind: string, name: string, alwaysFail: ServiceResult): PrometheusProvider => ({
  kind,
  name,
  isConfigurable: false,
  getQuery: () => {
    throw new Error("getQuery is not implemented.");
  },
  getPrometheusService: async () => {
    switch (alwaysFail) {
      case ServiceResult.Success:
        return {
          kind,
          namespace: "default",
          port: 7000,
          service: "",
        };
      case ServiceResult.Failure:
        throw new Error("does fail");
    }
  },
});

const proxyConfigValue = jsyaml.dump({
  apiVersion: "v1",
  clusters: [{
    cluster: {
      server: "https://127.0.0.1:55009",
    },
    name: "some-cluster-name",
  }],
  users: [{
    name: "some-user-name",
    user: {
      "client-certificate": "/some/path/to/client-cert",
      "client-key": "/some/path/to/client-key",
    },
  }],
  contexts: [{
    name: "some-proxy-context",
    context: {
      user: "some-user-name",
      cluster: "some-cluster-name",
    },
  }],
  "current-context": "some-proxy-context",
});

describe("ContextHandler", () => {
  let createContextHandler: (cluster: Cluster) => ClusterContextHandler;
  let di: DiContainer;
  let cluster: Cluster;
  let readFileMock: AsyncFnMock<ReadFile>;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    di.override(createKubeAuthProxyInjectable, () => () => ({
      run: async () => {},
    } as Partial<KubeAuthProxy> as KubeAuthProxy));
    di.override(createKubeconfigManagerInjectable, () => () => ({
      getPath: async () => "/some/proxy-kubeconfig",
    } as Partial<KubeconfigManager> as KubeconfigManager));
    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");
    di.override(directoryForTempInjectable, () => "/some-directory-for-temp-data");

    readFileMock = asyncFn();
    di.override(readFileInjectable, () => readFileMock);

    createContextHandler = di.inject(createContextHandlerInjectable);

    const createCluster = di.inject(createClusterInjectable);

    cluster = createCluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some/path/to/kubeconfig",
    }, {
      clusterServerUrl: "https://localhost:81",
    });
  });

  describe("getPrometheusService", () => {
    for (let failures = 0; failures < 4; failures += 1) {
      describe(`with ${failures} providers that throw`, () => {
        beforeEach(() => {
          runInAction(() => {
            for (let i = 0; i < failures; i += 1) {
              di.register(getInjectable({
                id: `test-prometheus-provider-failure-${i}`,
                injectionToken: prometheusProviderInjectionToken,
                instantiate: () => createTestPrometheusProvider(`id_failure_${i}`, `TestService-${i}`, ServiceResult.Failure),
              }));
            }
          });
        });

        describe("when getting prometheus details", () => {
          let details: Promise<AsyncResult<PrometheusDetails, Error>>;

          beforeEach(() => {
            details = createContextHandler(cluster).getPrometheusDetails();
          });

          it("should read the proxy config file", () => {
            expect(readFileMock).toBeCalledWith("/some/proxy-kubeconfig");
          });

          describe("when reading the proxy config file resolves", () => {
            beforeEach(async () => {
              await readFileMock.resolveSpecific(
                ["/some/proxy-kubeconfig"],
                proxyConfigValue,
              );
            });

            it("should resolve with a failed call", async () => {
              await expect(details).resolves.toMatchObject({ callWasSuccessful: false });
            });
          });
        });
      });
    }

    for (let successes = 1; successes < 3; successes += 1) {
      for (let failures = 0; failures < 4; failures += 1) {
        describe(`with ${successes} successful providers followed by ${failures} erroring providers`, () => {
          beforeEach(() => {
            runInAction(() => {
              for (let i = 0; i < failures; i += 1) {
                di.register(getInjectable({
                  id: `test-prometheus-provider-failure-${i}`,
                  injectionToken: prometheusProviderInjectionToken,
                  instantiate: () => createTestPrometheusProvider(`id_failure_${i}`, `TestService-${i}`, ServiceResult.Failure),
                }));
              }

              for (let i = 0; i < successes; i += 1) {
                di.register(getInjectable({
                  id: `test-prometheus-provider-success-${i}`,
                  injectionToken: prometheusProviderInjectionToken,
                  instantiate: () => createTestPrometheusProvider(`id_success_${i}`, `TestService-${i+10}`, ServiceResult.Success),
                }));
              }
            });
          });

          describe("when getting prometheus details", () => {
            let details: Promise<AsyncResult<PrometheusDetails, Error>>;

            beforeEach(() => {
              details = createContextHandler(cluster).getPrometheusDetails();
            });

            it("should read the proxy config file", () => {
              expect(readFileMock).toBeCalledWith("/some/proxy-kubeconfig");
            });

            describe("when reading the proxy config file resolves", () => {
              beforeEach(async () => {
                await readFileMock.resolveSpecific(
                  ["/some/proxy-kubeconfig"],
                  proxyConfigValue,
                );
              });

              it("should resolve with the first success provider", async () => {
                const result = await details;

                assert(result.callWasSuccessful);

                expect(result.response).toMatchObject({
                  provider: {
                    kind: `id_success_0`,
                  },
                });
              });
            });
          });
        });
      }
    }

    for (let successes = 1; successes < 3; successes += 1) {
      for (let failures = 0; failures < 4; failures += 1) {
        const beforeSuccesses = Math.floor(successes / 2);

        describe(`with ${successes} successful providers between by ${failures} erroring providers`, () => {
          beforeEach(() => {
            runInAction(() => {
              for (let i = 0; i < beforeSuccesses; i += 1) {
                di.register(getInjectable({
                  id: `test-prometheus-provider-success-${i}`,
                  injectionToken: prometheusProviderInjectionToken,
                  instantiate: () => createTestPrometheusProvider(`id_success_${i}`, `TestService-${i}`, ServiceResult.Success),
                }));
              }

              for (let i = 0; i < failures; i += 1) {
                di.register(getInjectable({
                  id: `test-prometheus-provider-failure-${i}`,
                  injectionToken: prometheusProviderInjectionToken,
                  instantiate: () => createTestPrometheusProvider(`id_failure_${i}`, `TestService-${i+10}`, ServiceResult.Failure),
                }));
              }

              for (let i = beforeSuccesses; i < successes; i += 1) {
                di.register(getInjectable({
                  id: `test-prometheus-provider-success-${i}`,
                  injectionToken: prometheusProviderInjectionToken,
                  instantiate: () => createTestPrometheusProvider(`id_success_${i}`, `TestService-${i+20}`, ServiceResult.Success),
                }));
              }
            });
          });

          describe("when getting prometheus details", () => {
            let details: Promise<AsyncResult<PrometheusDetails, Error>>;

            beforeEach(() => {
              details = createContextHandler(cluster).getPrometheusDetails();
            });

            it("should read the proxy config file", () => {
              expect(readFileMock).toBeCalledWith("/some/proxy-kubeconfig");
            });

            describe("when reading the proxy config file resolves", () => {
              beforeEach(async () => {
                await readFileMock.resolveSpecific(
                  ["/some/proxy-kubeconfig"],
                  proxyConfigValue,
                );
              });

              it("should resolve with the first success provider", async () => {
                const result = await details;

                assert(result.callWasSuccessful);

                expect(result.response).toMatchObject({
                  provider: {
                    kind: `id_success_0`,
                  },
                });
              });
            });
          });
        });
      }
    }
  });
});
