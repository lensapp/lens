/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeApiWatchCallback } from "../kube-api";
import { KubeApi } from "../kube-api";
import { PassThrough } from "stream";
import { PodApi } from "../endpoints";
import type { DeploymentApi, NamespaceApi  } from "../endpoints";
import { Deployment, Pod } from "@k8slens/kube-object";
import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import type { Fetch } from "../../fetch/fetch.injectable";
import fetchInjectable from "../../fetch/fetch.injectable";
import type { CreateKubeApiForRemoteCluster } from "../create-kube-api-for-remote-cluster.injectable";
import createKubeApiForRemoteClusterInjectable from "../create-kube-api-for-remote-cluster.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { flushPromises } from "@k8slens/test-utils";
import createKubeJsonApiInjectable from "../create-kube-json-api.injectable";
import type { IKubeWatchEvent } from "../kube-watch-event";
import type { KubeJsonApiDataFor, KubeStatusData, KubeJsonApiData } from "@k8slens/kube-object";
import setupAutoRegistrationInjectable from "../../../renderer/before-frame-starts/runnables/setup-auto-registration.injectable";
import { createMockResponseFromStream, createMockResponseFromString } from "../../../test-utils/mock-responses";
import storesAndApisCanBeCreatedInjectable from "../../../renderer/stores-apis-can-be-created.injectable";
import directoryForUserDataInjectable from "../../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import hostedClusterInjectable from "../../../renderer/cluster-frame-context/hosted-cluster.injectable";
import directoryForKubeConfigsInjectable from "../../app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import apiKubeInjectable from "../../../renderer/k8s/api-kube.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import deploymentApiInjectable from "../endpoints/deployment.api.injectable";
import podApiInjectable from "../endpoints/pod.api.injectable";
import namespaceApiInjectable from "../endpoints/namespace.api.injectable";

// NOTE: this is fine because we are testing something that only exported
// eslint-disable-next-line no-restricted-imports
import { PodsApi } from "../../../extensions/common-api/k8s-api";
import { Cluster } from "../../cluster/cluster";

describe("createKubeApiForRemoteCluster", () => {
  let createKubeApiForRemoteCluster: CreateKubeApiForRemoteCluster;
  let fetchMock: AsyncFnMock<Fetch>;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);

    di.override(hostedClusterInjectable, () => new Cluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }));

    fetchMock = asyncFn();
    di.override(fetchInjectable, () => fetchMock);

    createKubeApiForRemoteCluster = di.inject(createKubeApiForRemoteClusterInjectable);
  });

  it("builds api client for KubeObject", () => {
    const api = createKubeApiForRemoteCluster({
      cluster: {
        server: "https://127.0.0.1:6443",
      },
      user: {
        token: "daa",
      },
    }, Pod);

    expect(api).toBeInstanceOf(KubeApi);
  });

  describe("when building for remote cluster with specific constructor", () => {
    let api: PodApi;

    beforeEach(() => {
      api = createKubeApiForRemoteCluster({
        cluster: {
          server: "https://127.0.0.1:6443",
        },
        user: {
          token: "daa",
        },
      }, Pod, PodsApi);
    });

    it("uses the constructor", () => {
      expect(api).toBeInstanceOf(PodApi);
    });

    describe("when calling list without namespace", () => {
      let listRequest: Promise<Pod[] | null>;

      beforeEach(async () => {
        listRequest = api.list();

        // This is required because of how JS promises work
        await flushPromises();
      });

      it("should request pods from default namespace", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "https://127.0.0.1:6443/api/v1/pods",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });

      describe("when request resolves with data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["https://127.0.0.1:6443/api/v1/pods"],
            createMockResponseFromString("https://127.0.0.1:6443/api/v1/pods", JSON.stringify({
              kind: "PodList",
              apiVersion: "v1",
              metadata:{
                resourceVersion: "452899",
              },
              items: [],
            })),
          );
        });

        it("resolves the list call", async () => {
          expect(await listRequest).toEqual([]);
        });
      });
    });
  });
});

describe("KubeApi", () => {
  let fetchMock: AsyncFnMock<Fetch>;
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);

    fetchMock = asyncFn();
    di.override(fetchInjectable, () => fetchMock);

    const createKubeJsonApi = di.inject(createKubeJsonApiInjectable);

    di.override(hostedClusterInjectable, () => new Cluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }));

    di.override(apiKubeInjectable, () => createKubeJsonApi({
      serverAddress: `http://127.0.0.1:9999`,
      apiBase: "/api-kube",
    }));

    const setupAutoRegistration = di.inject(setupAutoRegistrationInjectable);

    setupAutoRegistration.run();
  });

  describe("patching deployments", () => {
    let api: DeploymentApi;

    beforeEach(() => {
      api = di.inject(deploymentApiInjectable);
    });

    describe("when patching a resource without providing a strategy", () => {
      let patchRequest: Promise<Deployment | null>;

      beforeEach(async () => {
        patchRequest = api.patch({ name: "test", namespace: "default" }, {
          spec: { replicas: 2 },
        });

        // This is needed because of how JS promises work
        await flushPromises();
      });

      it("requests a patch using strategic merge", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test",
          {
            headers: {
              "content-type": "application/strategic-merge-patch+json",
            },
            method: "patch",
            body: JSON.stringify({ spec: { replicas: 2 }}),
          },
        ]);
      });

      describe("when the patch request resolves with data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test", JSON.stringify({
              apiVersion: "v1",
              kind: "Deployment",
              metadata: {
                name: "test",
                namespace: "default",
                resourceVersion: "1",
                uid: "12345",
              },
              spec: {
                replicas: 2,
              },
            })),
          );
        });

        it("resolves the patch call", async () => {
          expect(await patchRequest).toBeInstanceOf(Deployment);
        });
      });
    });

    describe("when patching a resource using json patch", () => {
      let patchRequest: Promise<Deployment | null>;

      beforeEach(async () => {
        patchRequest = api.patch({ name: "test", namespace: "default" }, [
          { op: "replace", path: "/spec/replicas", value: 2 },
        ], "json");

        // This is needed because of how JS promises work
        await flushPromises();
      });

      it("requests a patch using json merge", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test",
          {
            headers: {
              "content-type": "application/json-patch+json",
            },
            method: "patch",
            body: JSON.stringify([
              { op: "replace", path: "/spec/replicas", value: 2 },
            ]),
          },
        ]);
      });

      describe("when the patch request resolves with data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test", JSON.stringify({
              apiVersion: "v1",
              kind: "Deployment",
              metadata: {
                name: "test",
                namespace: "default",
                resourceVersion: "1",
                uid: "12345",
              },
              spec: {
                replicas: 2,
              },
            })),
          );
        });

        it("resolves the patch call", async () => {
          expect(await patchRequest).toBeInstanceOf(Deployment);
        });
      });
    });

    describe("when patching a resource using merge patch", () => {
      let patchRequest: Promise<Deployment | null>;

      beforeEach(async () => {
        patchRequest = api.patch(
          { name: "test", namespace: "default" },
          { metadata: { annotations: { provisioned: "True" }}},
          "merge",
        );

        // This is needed because of how JS promises work
        await flushPromises();
      });

      it("requests a patch using json merge", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test",
          {
            headers: {
              "content-type": "application/merge-patch+json",
            },
            method: "patch",
            body: JSON.stringify({ metadata: { annotations: { provisioned: "True" }}}),
          },
        ]);
      });

      describe("when the patch request resolves with data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test", JSON.stringify({
              apiVersion: "v1",
              kind: "Deployment",
              metadata: {
                name: "test",
                namespace: "default",
                resourceVersion: "1",
                uid: "12345",
                annotations: {
                  provisioned: "True",
                },
              },
            })),
          );
        });

        it("resolves the patch call", async () => {
          expect(await patchRequest).toBeInstanceOf(Deployment);
        });
      });
    });
  });

  describe("deleting pods (namespace scoped resource)", () => {
    let api: PodApi;

    beforeEach(() => {
      api = di.inject(podApiInjectable);
    });

    describe("when deleting by just name", () => {
      let deleteRequest: Promise<KubeJsonApiData>;

      beforeEach(async () => {
        deleteRequest = api.delete({ name: "foo" });

        // This is required for how JS promises work
        await flushPromises();
      });

      it("requests deleting pod in default namespace", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foo?propagationPolicy=Background",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "delete",
          },
        ]);
      });

      describe("when request resolves", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foo?propagationPolicy=Background"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foo?propagationPolicy=Background", "{}"),
          );
        });

        it("resolves the call", async () => {
          expect(await deleteRequest).toBeDefined();
        });
      });
    });

    describe("when deleting by name and empty namespace", () => {
      let deleteRequest: Promise<KubeJsonApiData>;

      beforeEach(async () => {
        deleteRequest = api.delete({ name: "foo", namespace: "" });

        // This is required for how JS promises work
        await flushPromises();
      });

      it("requests deleting pod in default namespace", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foo?propagationPolicy=Background",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "delete",
          },
        ]);
      });

      describe("when request resolves", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foo?propagationPolicy=Background"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foo?propagationPolicy=Background", "{}"),
          );
        });

        it("resolves the call", async () => {
          expect(await deleteRequest).toBeDefined();
        });
      });
    });

    describe("when deleting by name and namespace", () => {
      let deleteRequest: Promise<KubeJsonApiData>;

      beforeEach(async () => {
        deleteRequest = api.delete({ name: "foo", namespace: "test" });

        // This is required for how JS promises work
        await flushPromises();
      });

      it("requests deleting pod in given namespace", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo?propagationPolicy=Background",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "delete",
          },
        ]);
      });

      describe("when request resolves", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo?propagationPolicy=Background"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo?propagationPolicy=Background", "{}"),
          );
        });

        it("resolves the call", async () => {
          expect(await deleteRequest).toBeDefined();
        });
      });
    });

    describe("eviction-api as better replacement for pod.delete() request", () => {
      let evictRequest: Promise<string>;

      beforeEach(() => {
        evictRequest = api.evict({ name: "foo", namespace: "test" });
      });

      it("requests evicting a pod in given namespace", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo/eviction",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "post",
          },
        ]);
      });

      it("should resolve the call with >=200 <300 http code", async () => {
        await fetchMock.resolveSpecific(
          ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo/eviction"],
          createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo/eviction", JSON.stringify({
            apiVersion: "policy/v1",
            kind: "Status",
            code: 201,
            status: "all good",
          } as KubeStatusData)),
        );

        expect(await evictRequest).toBe("201: all good");
      });

      it("should throw in case of error", async () => {
        await fetchMock.resolveSpecific(
          ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo/eviction"],
          createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo/eviction", JSON.stringify({
            apiVersion: "policy/v1",
            kind: "Status",
            code: 500,
            status: "something went wrong",
          } as KubeStatusData)),
        );

        await expect(async () => evictRequest).rejects.toBe("500: something went wrong");
      });
    });
  });

  describe("deleting namespaces (cluster scoped resource)", () => {
    let api: NamespaceApi;

    beforeEach(() => {
      api = di.inject(namespaceApiInjectable);
    });

    describe("when deleting by just name", () => {
      let deleteRequest: Promise<KubeJsonApiData>;

      beforeEach(async () => {
        deleteRequest = api.delete({ name: "foo" });

        // This is required for how JS promises work
        await flushPromises();
      });

      it("requests deleting Namespace without namespace", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/foo?propagationPolicy=Background",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "delete",
          },
        ]);
      });

      describe("when request resolves", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/foo?propagationPolicy=Background"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/namespaces/foo?propagationPolicy=Background", "{}"),
          );
        });

        it("resolves the call", async () => {
          expect(await deleteRequest).toBeDefined();
        });
      });
    });

    describe("when deleting by name and empty namespace", () => {
      let deleteRequest: Promise<KubeJsonApiData>;

      beforeEach(async () => {
        deleteRequest = api.delete({ name: "foo", namespace: "" });

        // This is required for how JS promises work
        await flushPromises();
      });

      it("requests deleting Namespace without namespace", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/foo?propagationPolicy=Background",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "delete",
          },
        ]);
      });

      describe("when request resolves", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/foo?propagationPolicy=Background"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/namespaces/foo?propagationPolicy=Background", "{}"),
          );
        });

        it("resolves the call", async () => {
          expect(await deleteRequest).toBeDefined();
        });
      });
    });

    describe("when deleting by name and namespace", () => {
      it("rejects request", async () => {
        await expect(api.delete({ name: "foo", namespace: "test" })).rejects.toBeDefined();
      });
    });
  });

  describe("watching pods", () => {
    let api: PodApi;
    let stream: PassThrough;

    beforeEach(() => {
      api = di.inject(podApiInjectable);
      stream = new PassThrough();
    });

    afterEach(() => {
      stream.end();
      stream.destroy();
    });

    describe("when watching in a namespace", () => {
      let stopWatch: () => void;
      let callback: jest.MockedFunction<KubeApiWatchCallback>;

      beforeEach(async () => {
        callback = jest.fn();
        stopWatch = api.watch({
          namespace: "kube-system",
          callback,
        });

        await flushPromises();
      });

      it("requests the watch", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=600",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });

      describe("when the request resolves with a stream", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ([url, init]) => {
              const isMatch = url === "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=600";

              if (isMatch) {
                init?.signal?.addEventListener("abort", () => {
                  stream.destroy();
                });
              }

              return isMatch;
            },
            createMockResponseFromStream("http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=600", stream),
          );
        });

        describe("when some data comes back on the stream", () => {
          beforeEach(() => {
            stream.emit("data", `${JSON.stringify({
              type: "ADDED",
              object: {
                apiVersion: "v1",
                kind: "Pod",
                metadata: {
                  name: "foobar",
                  namespace: "kube-system",
                  resourceVersion: "1",
                  uid: "123456",
                },
              },
            } as IKubeWatchEvent<KubeJsonApiDataFor<Pod>>)}\n`);
          });

          it("calls the callback with the data", () => {
            expect(callback).toBeCalledWith(
              {
                type: "ADDED",
                object: {
                  apiVersion: "v1",
                  kind: "Pod",
                  metadata: {
                    name: "foobar",
                    namespace: "kube-system",
                    resourceVersion: "1",
                    selfLink: "/api/v1/namespaces/kube-system/pods/foobar",
                    uid: "123456",
                  },
                },
              },
              null,
            );
          });

          describe("when stopping the watch", () => {
            beforeEach(() => {
              stopWatch();
            });

            it("closes the stream", () => {
              expect(stream.destroyed).toBe(true);
            });
          });
        });
      });
    });

    describe("when watching in a namespace with an abort controller provided", () => {
      let callback: jest.MockedFunction<KubeApiWatchCallback>;
      let abortController: AbortController;

      beforeEach(async () => {
        callback = jest.fn();
        abortController = new AbortController();
        api.watch({
          namespace: "kube-system",
          callback,
          abortController,
        });

        await flushPromises();
      });

      it("requests the watch", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=600",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });

      describe("when the request resolves with a stream", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ([url, init]) => {
              const isMatch = url === "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=600";

              if (isMatch) {
                init?.signal?.addEventListener("abort", () => {
                  stream.destroy();
                });
              }

              return isMatch;
            },
            createMockResponseFromStream("http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=600", stream),
          );
        });

        describe("when some data comes back on the stream", () => {
          beforeEach(() => {
            stream.emit("data", `${JSON.stringify({
              type: "ADDED",
              object: {
                apiVersion: "v1",
                kind: "Pod",
                metadata: {
                  name: "foobar",
                  namespace: "kube-system",
                  resourceVersion: "1",
                  uid: "123456",
                },
              },
            } as IKubeWatchEvent<KubeJsonApiDataFor<Pod>>)}\n`);
          });

          it("calls the callback with the data", () => {
            expect(callback).toBeCalledWith(
              {
                type: "ADDED",
                object: {
                  apiVersion: "v1",
                  kind: "Pod",
                  metadata: {
                    name: "foobar",
                    namespace: "kube-system",
                    resourceVersion: "1",
                    selfLink: "/api/v1/namespaces/kube-system/pods/foobar",
                    uid: "123456",
                  },
                },
              },
              null,
            );
          });

          describe("when stopping the watch via the controller", () => {
            beforeEach(() => {
              abortController.abort();
            });

            it("closes the stream", () => {
              expect(stream.destroyed).toBe(true);
            });
          });
        });
      });
    });

    describe("when watching in a namespace with a timeout", () => {
      let stopWatch: () => void;
      let callback: jest.MockedFunction<KubeApiWatchCallback>;

      beforeEach(async () => {
        callback = jest.fn();
        stopWatch = api.watch({
          namespace: "kube-system",
          callback,
          timeout: 60,
        });

        await flushPromises();
      });

      it("requests the watch", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=60",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });

      describe("when the request resolves with a stream", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ([url, init]) => {
              const isMatch = url === "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=60";

              if (isMatch) {
                init?.signal?.addEventListener("abort", () => {
                  stream.destroy();
                });
              }

              return isMatch;
            },
            createMockResponseFromStream("http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=60", stream),
          );
        });

        describe("when some data comes back on the stream", () => {
          beforeEach(() => {
            stream.emit("data", `${JSON.stringify({
              type: "ADDED",
              object: {
                apiVersion: "v1",
                kind: "Pod",
                metadata: {
                  name: "foobar",
                  namespace: "kube-system",
                  resourceVersion: "1",
                  uid: "123456",
                },
              },
            } as IKubeWatchEvent<KubeJsonApiDataFor<Pod>>)}\n`);
          });

          it("calls the callback with the data", () => {
            expect(callback).toBeCalledWith(
              {
                type: "ADDED",
                object: {
                  apiVersion: "v1",
                  kind: "Pod",
                  metadata: {
                    name: "foobar",
                    namespace: "kube-system",
                    resourceVersion: "1",
                    selfLink: "/api/v1/namespaces/kube-system/pods/foobar",
                    uid: "123456",
                  },
                },
              },
              null,
            );
          });

          describe("when stopping the watch", () => {
            beforeEach(() => {
              stopWatch();
            });

            it("closes the stream", () => {
              expect(stream.destroyed).toBe(true);
            });
          });

          describe("when the watch ends", () => {
            beforeEach(() => {
              stream.end();
            });

            it("requests a new watch", () => {
              expect(fetchMock.mock.lastCall).toMatchObject([
                "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=60",
                {
                  headers: {
                    "content-type": "application/json",
                  },
                  method: "get",
                },
              ]);
            });

            describe("when stopping the watch", () => {
              beforeEach(() => {
                stopWatch();
              });

              it("closes the stream", () => {
                expect(stream.destroyed).toBe(true);
              });
            });
          });
        });
      });
    });
  });

  describe("creating pods", () => {
    let api: PodApi;

    beforeEach(() => {
      api = di.inject(podApiInjectable);
    });

    describe("when creating a pod", () => {
      let createRequest: Promise<Pod | null>;

      beforeEach(async () => {
        createRequest = api.create({
          name: "foobar",
          namespace: "default",
        }, {
          metadata: {
            labels: {
              foo: "bar",
            },
          },
          spec: {
            containers: [
              {
                name: "web",
                image: "nginx",
                ports: [
                  {
                    name: "web",
                    containerPort: 80,
                    protocol: "TCP",
                  },
                ],
              },
            ],
          },
        });

        // This is required because of how JS promises work
        await flushPromises();
      });

      it("should request to create a pod with full descriptor", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "post",
            body: JSON.stringify({
              metadata: {
                labels: {
                  foo: "bar",
                },
                name: "foobar",
                namespace: "default",
              },
              spec: {
                containers: [{
                  name: "web",
                  image: "nginx",
                  ports: [{
                    name: "web",
                    containerPort: 80,
                    protocol: "TCP",
                  }],
                }],
              },
              kind: "Pod",
              apiVersion: "v1",
            }),
          },
        ]);
      });

      describe("when request resolves with data", () => {
        beforeEach(async () =>  {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods", JSON.stringify({
              kind: "Pod",
              apiVersion: "v1",
              metadata: {
                name: "foobar",
                namespace: "default",
                labels: {
                  foo: "bar",
                },
                resourceVersion: "1",
                uid: "123456798",
              },
              spec: {
                containers: [{
                  name: "web",
                  image: "nginx",
                  ports: [{
                    name: "web",
                    containerPort: 80,
                    protocol: "TCP",
                  }],
                }],
              },
            })),
          );
        });

        it("call should resolve in a Pod instance", async () => {
          expect(await createRequest).toBeInstanceOf(Pod);
        });
      });
    });
  });

  describe("updating pods", () => {
    let api: PodApi;

    beforeEach(() => {
      api = di.inject(podApiInjectable);
    });

    describe("when updating a pod", () => {
      let updateRequest: Promise<Pod | null>;

      beforeEach(async () => {
        updateRequest = api.update({
          name: "foobar",
          namespace: "default",
        }, {
          kind: "Pod",
          apiVersion: "v1",
          metadata: {
            labels: {
              foo: "bar",
            },
          },
          spec: {
            containers: [{
              name: "web",
              image: "nginx",
              ports: [{
                name: "web",
                containerPort: 80,
                protocol: "TCP",
              }],
            }],
          },
        });

        await flushPromises();
      });

      it("should request that the pod is updated", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foobar",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "put",
            body: JSON.stringify({
              kind: "Pod",
              apiVersion: "v1",
              metadata: {
                labels: {
                  foo: "bar",
                },
                name: "foobar",
                namespace: "default",
              },
              spec: {
                containers: [{
                  name: "web",
                  image: "nginx",
                  ports: [{
                    name: "web",
                    containerPort: 80,
                    protocol: "TCP",
                  }],
                }],
              },
            }),
          },
        ]);
      });

      describe("when the request resolves with data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foobar"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foobar", JSON.stringify({
              kind: "Pod",
              apiVersion: "v1",
              metadata: {
                name: "foobar",
                namespace: "default",
                labels: {
                  foo: "bar",
                },
                resourceVersion: "1",
                uid: "123456798",
              },
              spec: {
                containers: [{
                  name: "web",
                  image: "nginx",
                  ports: [{
                    name: "web",
                    containerPort: 80,
                    protocol: "TCP",
                  }],
                }],
              },
            })),
          );
        });

        it("the call should resolve to a Pod", async () => {
          expect(await updateRequest).toBeInstanceOf(Pod);
        });
      });
    });
  });

  describe("listing pods", () => {
    let api: PodApi;

    beforeEach(() => {
      api = di.inject(podApiInjectable);
    });

    describe("when listing pods with no descriptor", () => {
      let listRequest: Promise<Pod[] | null>;

      beforeEach(async () => {
        listRequest = api.list();

        await flushPromises();
      });

      it("should request that the pods from all namespaces", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/pods",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });

      describe("when the request resolves with empty data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/pods"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/pods", JSON.stringify({
              kind: "PodList",
              apiVersion: "v1",
              metadata: {},
              items: [],
            })),
          );
        });

        it("the call should resolve to an empty list", async () => {
          expect(await listRequest).toEqual([]);
        });
      });
    });

    describe("when listing pods with descriptor with namespace=''", () => {
      let listRequest: Promise<Pod[] | null>;

      beforeEach(async () => {
        listRequest = api.list({
          namespace: "",
        });

        await flushPromises();
      });

      it("should request that the pods from all namespaces", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/pods",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });

      describe("when the request resolves with empty data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/pods"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/pods", JSON.stringify({
              kind: "PodList",
              apiVersion: "v1",
              metadata: {},
              items: [],
            })),
          );
        });

        it("the call should resolve to an empty list", async () => {
          expect(await listRequest).toEqual([]);
        });
      });
    });

    describe("when listing pods with descriptor with namespace='default'", () => {
      let listRequest: Promise<Pod[] | null>;

      beforeEach(async () => {
        listRequest = api.list({
          namespace: "default",
        });

        await flushPromises();
      });

      it("should request that the pods from just the default namespace", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });

      describe("when the request resolves with empty data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods", JSON.stringify({
              kind: "PodList",
              apiVersion: "v1",
              metadata: {},
              items: [],
            })),
          );
        });

        it("the call should resolve to an empty list", async () => {
          expect(await listRequest).toEqual([]);
        });
      });
    });
  });
});
