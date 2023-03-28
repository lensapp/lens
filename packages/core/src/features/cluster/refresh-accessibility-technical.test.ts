/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { AuthorizationV1Api, CoreV1Api, V1APIGroupList, V1APIVersions, V1NamespaceList, V1SelfSubjectAccessReview, V1SelfSubjectRulesReview } from "@kubernetes/client-node";
import type { Cluster } from "../../common/cluster/cluster";
import createAuthorizationApiInjectable from "../../common/cluster/create-authorization-api.injectable";
import writeJsonFileInjectable from "../../common/fs/write-json-file.injectable";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import broadcastMessageInjectable from "../../common/ipc/broadcast-message.injectable";
import type { PartialDeep } from "type-fest";
import { anyObject } from "jest-mock-extended";
import createCoreApiInjectable from "../../common/cluster/create-core-api.injectable";
import type { K8sRequest } from "../../main/k8s-request.injectable";
import k8sRequestInjectable from "../../main/k8s-request.injectable";
import type { DetectClusterMetadata } from "../../main/cluster-detectors/detect-cluster-metadata.injectable";
import detectClusterMetadataInjectable from "../../main/cluster-detectors/detect-cluster-metadata.injectable";
import type { ClusterConnection } from "../../main/cluster/cluster-connection.injectable";
import clusterConnectionInjectable from "../../main/cluster/cluster-connection.injectable";
import type { KubeAuthProxy } from "../../main/kube-auth-proxy/create-kube-auth-proxy.injectable";
import createKubeAuthProxyInjectable from "../../main/kube-auth-proxy/create-kube-auth-proxy.injectable";
import type { Mocked } from "../../test-utils/mock-interface";
import { flushPromises } from "@k8slens/test-utils";
import addClusterInjectable from "./storage/common/add.injectable";

describe("Refresh Cluster Accessibility Technical Tests", () => {
  let builder: ApplicationBuilder;
  let createSelfSubjectRulesReviewMock: AsyncFnMock<AuthorizationV1Api["createSelfSubjectRulesReview"]>;
  let createSelfSubjectAccessReviewMock: AsyncFnMock<AuthorizationV1Api["createSelfSubjectAccessReview"]>;
  let listNamespaceMock: AsyncFnMock<CoreV1Api["listNamespace"]>;
  let k8sRequestMock: AsyncFnMock<K8sRequest>;
  let detectClusterMetadataMock: AsyncFnMock<DetectClusterMetadata>;
  let kubeAuthProxyMock: Mocked<KubeAuthProxy>;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    const mainDi = builder.mainDi;

    mainDi.override(broadcastMessageInjectable, () => async () => {});

    kubeAuthProxyMock = {
      apiPrefix: "/some-api-prefix",
      port: 0,
      exit: jest.fn(),
      run: asyncFn(),
    };
    mainDi.override(createKubeAuthProxyInjectable, () => () => kubeAuthProxyMock);

    detectClusterMetadataMock = asyncFn();
    mainDi.override(detectClusterMetadataInjectable, () => detectClusterMetadataMock);

    k8sRequestMock = asyncFn();
    mainDi.override(k8sRequestInjectable, () => k8sRequestMock);

    createSelfSubjectRulesReviewMock = asyncFn();
    createSelfSubjectAccessReviewMock = asyncFn();
    mainDi.override(createAuthorizationApiInjectable, () => () => ({
      createSelfSubjectRulesReview: createSelfSubjectRulesReviewMock,
      createSelfSubjectAccessReview: createSelfSubjectAccessReviewMock,
    } as any));

    listNamespaceMock = asyncFn();
    mainDi.override(createCoreApiInjectable, () => () => ({
      listNamespace: listNamespaceMock,
    } as any));

    await builder.render();
  });

  describe("given a cluster with no configured preferences", () => {
    let cluster: Cluster;
    let clusterConnection: ClusterConnection;
    let refreshPromise: Promise<void>;

    beforeEach(async () => {
      const mainDi = builder.mainDi;
      const addCluster = mainDi.inject(addClusterInjectable);
      const writeJsonFile = mainDi.inject(writeJsonFileInjectable);

      await writeJsonFile("/some-kube-config-path", {
        apiVersion: "v1",
        kind: "Config",
        clusters: [{
          name: "some-cluster-name",
          cluster: {
            server: "https://localhost:8989",
          },
        }],
        users: [{
          name: "some-user-name",
        }],
        contexts: [{
          name: "some-cluster-context",
          context: {
            user: "some-user-name",
            cluster: "some-cluster-name",
          },
        }],
      });

      cluster = addCluster({
        contextName: "some-cluster-context",
        id: "some-cluster-id",
        kubeConfigPath: "/some-kube-config-path",
      });
      clusterConnection = mainDi.inject(clusterConnectionInjectable, cluster);
      refreshPromise = clusterConnection.refreshAccessibilityAndMetadata();
    });

    it("starts kubeAuthProxy", () => {
      expect(kubeAuthProxyMock.run).toBeCalled();
    });

    describe("when kubeAuthProxy has started running and its port is found", () => {
      beforeEach(async () => {
        kubeAuthProxyMock.port = 1235;
        await kubeAuthProxyMock.run.resolve();
        await flushPromises();
      });

      it("requests if cluster has admin permissions", async () => {
        expect(createSelfSubjectAccessReviewMock).toBeCalledWith(anyObject({
          spec: {
            namespace: "kube-system",
            resource: "*",
            verb: "create",
          },
        }));
      });

      describe.each([ true, false ])("when cluster admin request resolves to %p", (isAdmin) => {
        beforeEach(async () => {
          await createSelfSubjectAccessReviewMock.resolve({
            body: {
              status: {
                allowed: isAdmin,
              },
            } as PartialDeep<V1SelfSubjectAccessReview>,
          } as any);
        });

        it("requests if cluster has global watch permissions", () => {
          expect(createSelfSubjectAccessReviewMock).toBeCalledWith(anyObject({
            spec: {
              verb: "watch",
              resource: "*",
            },
          }));
        });

        describe.each([ true, false ])("when cluster global watch request resolves with %p", (globalWatch) => {
          beforeEach(async () => {
            await createSelfSubjectAccessReviewMock.resolve({
              body: {
                status: {
                  allowed: globalWatch,
                },
              } as PartialDeep<V1SelfSubjectAccessReview>,
            } as any);
          });

          it("requests namespaces", () => {
            expect(listNamespaceMock).toBeCalled();
          });

          describe("when list namespaces resolves", () => {
            beforeEach(async () => {
              await listNamespaceMock.resolve(listNamespaceResponse);
            });

            it("requests core api versions", () => {
              expect(k8sRequestMock).toBeCalledWith(
                anyObject({ id: "some-cluster-id" }),
                "/api",
              );
            });

            describe("when core api versions request resolves", () => {
              beforeEach(async () => {
                await k8sRequestMock.resolve({
                  serverAddressByClientCIDRs: [],
                  versions: [
                    "v1",
                  ],
                } as V1APIVersions);
              });

              it("requests non-core api resource kinds", () => {
                expect(k8sRequestMock).toBeCalledWith(
                  anyObject({ id: "some-cluster-id" }),
                  "/apis",
                );
              });

              describe("when non-core api resource kinds request resolves", () => {
                beforeEach(async () => {
                  await k8sRequestMock.resolve(nonCoreApiResponse);
                });

                it("requests specific resource kinds in core", () => {
                  expect(k8sRequestMock).toBeCalledWith(
                    anyObject({ id: "some-cluster-id" }),
                    "/api/v1",
                  );
                });

                describe("when core specific resource kinds request resolves", () => {
                  beforeEach(async () => {
                    await k8sRequestMock.resolve(coreApiKindsResponse);
                  });

                  it("requests specific resources kinds from the first non-core response", () => {
                    expect(k8sRequestMock).toBeCalledWith(
                      anyObject({ id: "some-cluster-id" }),
                      "/apis/node.k8s.io/v1",
                    );
                  });

                  describe("when first specific resource kinds request resolves", () => {
                    beforeEach(async () => {
                      await k8sRequestMock.resolve(nodeK8sIoKindsResponse);
                    });

                    it("requests specific resources kinds from the second non-core response", () => {
                      expect(k8sRequestMock).toBeCalledWith(
                        anyObject({ id: "some-cluster-id" }),
                        "/apis/discovery.k8s.io/v1",
                      );
                    });

                    describe("when second specific resource kinds request resolves", () => {
                      beforeEach(async () => {
                        await k8sRequestMock.resolve(discoveryK8sIoKindsResponse);
                      });

                      it("requests namespace list permissions for 'default' namespace", () => {
                        expect(createSelfSubjectRulesReviewMock).toBeCalledWith(anyObject({
                          spec: {
                            namespace: "default",
                          },
                        }));
                      });

                      describe("when the permissions are incomplete", () => {
                        beforeEach(async () => {
                          await createSelfSubjectRulesReviewMock.resolve(defaultIncompletePermissions);
                        });

                        it("requests namespace list permissions for 'my-namespace' namespace", () => {
                          expect(createSelfSubjectRulesReviewMock).toBeCalledWith(anyObject({
                            spec: {
                              namespace: "my-namespace",
                            },
                          }));
                        });

                        describe("when the permissions request for 'my-namespace' resolves as empty", () => {
                          beforeEach(async () => {
                            await createSelfSubjectRulesReviewMock.resolve(emptyPermissions);
                          });

                          it("requests cluster metadata", () => {
                            expect(detectClusterMetadataMock).toBeCalledWith(anyObject({ id: "some-cluster-id" }));
                          });

                          describe("when cluster metadata request resolves", () => {
                            beforeEach(async () => {
                              await detectClusterMetadataMock.resolve({});
                            });

                            it("allows the call to refreshAccessibilityAndMetadata to resolve", async () => {
                              await refreshPromise;
                            });

                            it("should have the cluster displaying 'pods'", () => {
                              expect(cluster.resourcesToShow.has("pods")).toBe(true);
                            });

                            it("should have the cluster displaying 'namespaces'", () => {
                              expect(cluster.resourcesToShow.has("namespaces")).toBe(true);
                            });
                          });
                        });

                        describe.skip("when the permissions are incomplete", () => {});
                        describe.skip("when the permissions resolve to a single entry with 'list' verb", () => {});
                        describe.skip("when the permissions resolve to multiple entries with the 'list' verb not on the first entry", () => {});
                      });

                      describe("when the permissions resolve to an empty list", () => {
                        beforeEach(async () => {
                          await createSelfSubjectRulesReviewMock.resolve(emptyPermissions);
                        });

                        it("requests namespace list permissions for 'my-namespace' namespace", () => {
                          expect(createSelfSubjectRulesReviewMock).toBeCalledWith(anyObject({
                            spec: {
                              namespace: "my-namespace",
                            },
                          }));
                        });

                        describe("when the permissions request for 'my-namespace' resolves as empty", () => {
                          beforeEach(async () => {
                            await createSelfSubjectRulesReviewMock.resolve(emptyPermissions);
                          });

                          it("requests cluster metadata", () => {
                            expect(detectClusterMetadataMock).toBeCalledWith(anyObject({ id: "some-cluster-id" }));
                          });

                          describe("when cluster metadata request resolves", () => {
                            beforeEach(async () => {
                              await detectClusterMetadataMock.resolve({});
                            });

                            it("allows the call to refreshAccessibilityAndMetadata to resolve", async () => {
                              await refreshPromise;
                            });

                            it("should have the cluster displaying 'pods'", () => {
                              expect(cluster.resourcesToShow.has("pods")).toBe(false);
                            });

                            it("should have the cluster not displaying 'namespaces'", () => {
                              expect(cluster.resourcesToShow.has("namespaces")).toBe(false);
                            });
                          });
                        });

                        describe.skip("when the permissions are incomplete", () => {});
                        describe.skip("when the permissions resolve to a single entry with 'list' verb", () => {});
                        describe.skip("when the permissions resolve to multiple entries with the 'list' verb not on the first entry", () => {});
                      });

                      describe("when the permissions resolve to a single entry with 'list' verb", () => {
                        beforeEach(async () => {
                          await createSelfSubjectRulesReviewMock.resolve(defaultSingleListPermissions);
                        });

                        it("requests namespace list permissions for 'my-namespace' namespace", () => {
                          expect(createSelfSubjectRulesReviewMock).toBeCalledWith(anyObject({
                            spec: {
                              namespace: "my-namespace",
                            },
                          }));
                        });

                        describe("when the permissions request for 'my-namespace' resolves as empty", () => {
                          beforeEach(async () => {
                            await createSelfSubjectRulesReviewMock.resolve(emptyPermissions);
                          });

                          it("requests cluster metadata", () => {
                            expect(detectClusterMetadataMock).toBeCalledWith(anyObject({ id: "some-cluster-id" }));
                          });

                          describe("when cluster metadata request resolves", () => {
                            beforeEach(async () => {
                              await detectClusterMetadataMock.resolve({});
                            });

                            it("allows the call to refreshAccessibilityAndMetadata to resolve", async () => {
                              await refreshPromise;
                            });

                            it("should have the cluster displaying 'pods'", () => {
                              expect(cluster.resourcesToShow.has("pods")).toBe(true);
                            });

                            it("should have the cluster not displaying 'namespaces'", () => {
                              expect(cluster.resourcesToShow.has("namespaces")).toBe(false);
                            });
                          });
                        });

                        describe.skip("when the permissions are incomplete", () => {});
                        describe.skip("when the permissions resolve to a single entry with 'list' verb", () => {});
                        describe.skip("when the permissions resolve to multiple entries with the 'list' verb not on the first entry", () => {});
                      });

                      describe("when the permissions resolve to multiple entries with the 'list' verb not on the first entry", () => {
                        beforeEach(async () => {
                          await createSelfSubjectRulesReviewMock.resolve(defaultMultipleListPermissions);
                        });

                        it("requests namespace list permissions for 'my-namespace' namespace", () => {
                          expect(createSelfSubjectRulesReviewMock).toBeCalledWith(anyObject({
                            spec: {
                              namespace: "my-namespace",
                            },
                          }));
                        });

                        describe("when the permissions request for 'my-namespace' resolves as empty", () => {
                          beforeEach(async () => {
                            await createSelfSubjectRulesReviewMock.resolve(emptyPermissions);
                          });

                          it("requests cluster metadata", () => {
                            expect(detectClusterMetadataMock).toBeCalledWith(anyObject({ id: "some-cluster-id" }));
                          });

                          describe("when cluster metadata request resolves", () => {
                            beforeEach(async () => {
                              await detectClusterMetadataMock.resolve({});
                            });

                            it("allows the call to refreshAccessibilityAndMetadata to resolve", async () => {
                              await refreshPromise;
                            });

                            it("should have the cluster displaying 'pods'", () => {
                              expect(cluster.resourcesToShow.has("pods")).toBe(true);
                            });

                            it("should have the cluster not displaying 'namespaces'", () => {
                              expect(cluster.resourcesToShow.has("namespaces")).toBe(false);
                            });
                          });
                        });

                        describe.skip("when the permissions are incomplete", () => {});
                        describe.skip("when the permissions resolve to a single entry with 'list' verb", () => {});
                        describe.skip("when the permissions resolve to multiple entries with the 'list' verb not on the first entry", () => {});
                      });
                    });

                    describe.skip("when second specific resource kinds rejects", () => {});
                  });
                });

                describe.skip("when first specific resource kinds rejects", () => {});
              });
            });
          });
        });
      });
    });
  });
});

const nonCoreApiResponse = {
  groups: [
    {
      name: "node.k8s.io",
      versions: [
        {
          groupVersion: "node.k8s.io/v1",
          version: "v1",
        },
      ],
      preferredVersion: {
        groupVersion: "node.k8s.io/v1",
        version: "v1",
      },
    },
    {
      name: "discovery.k8s.io",
      versions: [
        {
          groupVersion: "discovery.k8s.io/v1",
          version: "v1",
        },
      ],
      preferredVersion: {
        groupVersion: "discovery.k8s.io/v1",
        version: "v1",
      },
    },
  ],
} as V1APIGroupList;

const listNamespaceResponse = {
  body: {
    items: [
      {
        metadata: {
          name: "default",
        },
      },
      {
        metadata: {
          name: "my-namespace",
        },
      },
    ],
  } as PartialDeep<V1NamespaceList>,
} as Awaited<ReturnType<CoreV1Api["listNamespace"]>>;

const coreApiKindsResponse = {
  kind: "APIResourceList",
  groupVersion: "v1",
  resources: [
    {
      name: "namespaces",
      singularName: "",
      namespaced: false,
      kind: "Namespace",
      verbs: ["create", "delete", "get", "list", "patch", "update", "watch"],
      shortNames: ["ns"],
      storageVersionHash: "Q3oi5N2YM8M=",
    },
    {
      name: "pods",
      singularName: "",
      namespaced: true,
      kind: "Pod",
      verbs: [
        "create",
        "delete",
        "deletecollection",
        "get",
        "list",
        "patch",
        "update",
        "watch",
      ],
      shortNames: ["po"],
      categories: ["all"],
      storageVersionHash: "xPOwRZ+Yhw8=",
    },
    {
      name: "pods/attach",
      singularName: "",
      namespaced: true,
      kind: "PodAttachOptions",
      verbs: ["create", "get"],
    },
  ],
};

const nodeK8sIoKindsResponse = {
  kind: "APIResourceList",
  apiVersion: "v1",
  groupVersion: "node.k8s.io/v1",
  resources: [
    {
      name: "runtimeclasses",
      singularName: "",
      namespaced: false,
      kind: "RuntimeClass",
      verbs: [
        "create",
        "delete",
        "deletecollection",
        "get",
        "list",
        "patch",
        "update",
        "watch",
      ],
      storageVersionHash: "WQTu1GL3T2Q=",
    },
  ],
};

const discoveryK8sIoKindsResponse = {
  kind: "APIResourceList",
  apiVersion: "v1",
  groupVersion: "discovery.k8s.io/v1",
  resources: [
    {
      name: "endpointslices",
      singularName: "",
      namespaced: true,
      kind: "EndpointSlice",
      verbs: [
        "create",
        "delete",
        "deletecollection",
        "get",
        "list",
        "patch",
        "update",
        "watch",
      ],
      storageVersionHash: "Nx3SIv6I0mE=",
    },
  ],
};

type CreateSelfSubjectRulesReviewRes = Awaited<ReturnType<AuthorizationV1Api["createSelfSubjectRulesReview"]>>;

const defaultIncompletePermissions = {
  body: {
    status: {
      incomplete: true,
    },
  } as PartialDeep<V1SelfSubjectRulesReview>,
} as CreateSelfSubjectRulesReviewRes;

const emptyPermissions = {
  body: {
    status: {
      resourceRules: [],
    },
  } as PartialDeep<V1SelfSubjectRulesReview>,
} as CreateSelfSubjectRulesReviewRes;

const defaultSingleListPermissions = {
  body: {
    status: {
      resourceRules: [{
        apiGroups: [""],
        resources: ["pods"],
        verbs: ["list"],
      }],
    },
  } as PartialDeep<V1SelfSubjectRulesReview>,
} as CreateSelfSubjectRulesReviewRes;

const defaultMultipleListPermissions = {
  body: {
    status: {
      resourceRules: [
        {
          apiGroups: [""],
          resources: ["pods"],
          verbs: ["get"],
        },
        {
          apiGroups: [""],
          resources: ["pods"],
          verbs: ["list"],
        },
      ],
    },
  } as PartialDeep<V1SelfSubjectRulesReview>,
} as CreateSelfSubjectRulesReviewRes;
