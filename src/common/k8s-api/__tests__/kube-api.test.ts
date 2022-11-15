/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeApiWatchCallback } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApi, KubeJsonApiData } from "../kube-json-api";
import { PassThrough } from "stream";
import { Deployment, DeploymentApi, NamespaceApi, Pod, PodApi } from "../endpoints";
import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import autoRegistrationInjectable from "../api-manager/auto-registration.injectable";
import type { Fetch } from "../../fetch/fetch.injectable";
import fetchInjectable from "../../fetch/fetch.injectable";
import type { CreateKubeApiForRemoteCluster } from "../create-kube-api-for-remote-cluster.injectable";
import createKubeApiForRemoteClusterInjectable from "../create-kube-api-for-remote-cluster.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { flushPromises } from "../../test-utils/flush-promises";
import createKubeJsonApiInjectable from "../create-kube-json-api.injectable";
import type { IKubeWatchEvent } from "../kube-watch-event";
import type { KubeJsonApiDataFor } from "../kube-object";
import type { Response, Headers as NodeFetchHeaders } from "node-fetch";
import AbortController from "abort-controller";

const createMockResponseFromString = (url: string, data: string, statusCode = 200) => {
  const res: jest.Mocked<Response> = {
    buffer: jest.fn(async () => { throw new Error("buffer() is not supported"); }),
    clone: jest.fn(() => res),
    arrayBuffer: jest.fn(async () => { throw new Error("arrayBuffer() is not supported"); }),
    blob: jest.fn(async () => { throw new Error("blob() is not supported"); }),
    body: new PassThrough(),
    bodyUsed: false,
    headers: new Headers() as NodeFetchHeaders,
    json: jest.fn(async () => JSON.parse(await res.text())),
    ok: 200 <= statusCode && statusCode < 300,
    redirected: 300 <= statusCode && statusCode < 400,
    size: data.length,
    status: statusCode,
    statusText: "some-text",
    text: jest.fn(async () => data),
    type: "basic",
    url,
    formData: jest.fn(async () => { throw new Error("formData() is not supported"); }),
  };

  return res;
};

const createMockResponseFromStream = (url: string, stream: NodeJS.ReadableStream, statusCode = 200) => {
  const res: jest.Mocked<Response> = {
    buffer: jest.fn(async () => { throw new Error("buffer() is not supported"); }),
    clone: jest.fn(() => res),
    arrayBuffer: jest.fn(async () => { throw new Error("arrayBuffer() is not supported"); }),
    blob: jest.fn(async () => { throw new Error("blob() is not supported"); }),
    body: stream,
    bodyUsed: false,
    headers: new Headers() as NodeFetchHeaders,
    json: jest.fn(async () => JSON.parse(await res.text())),
    ok: 200 <= statusCode && statusCode < 300,
    redirected: 300 <= statusCode && statusCode < 400,
    size: 10,
    status: statusCode,
    statusText: "some-text",
    text: jest.fn(() => {
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on("error", (err) => reject(err));
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });
    }),
    type: "basic",
    url,
    formData: jest.fn(async () => { throw new Error("formData() is not supported"); }),
  };

  return res;
};

describe("createKubeApiForRemoteCluster", () => {
  let createKubeApiForRemoteCluster: CreateKubeApiForRemoteCluster;
  let fetchMock: AsyncFnMock<Fetch>;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    fetchMock = asyncFn();
    di.override(fetchInjectable, () => fetchMock);

    createKubeApiForRemoteCluster = di.inject(createKubeApiForRemoteClusterInjectable);
  });

  it("builds api client for KubeObject", async () => {
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
      }, Pod, PodApi);
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
  let request: KubeJsonApi;
  let fetchMock: AsyncFnMock<Fetch>;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    fetchMock = asyncFn();
    di.override(fetchInjectable, () => fetchMock);

    const createKubeJsonApi = di.inject(createKubeJsonApiInjectable);

    request = createKubeJsonApi({
      serverAddress: `http://127.0.0.1:9999`,
      apiBase: "/api-kube",
    });

    di.inject(autoRegistrationInjectable);
  });

  describe("patching deployments", () => {
    let api: DeploymentApi;

    beforeEach(() => {
      api = new DeploymentApi({
        request,
      });
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
      api = new PodApi({
        request,
      });
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
          fetchMock.resolveSpecific(
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
          fetchMock.resolveSpecific(
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
          fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo?propagationPolicy=Background"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo?propagationPolicy=Background", "{}"),
          );
        });

        it("resolves the call", async () => {
          expect(await deleteRequest).toBeDefined();
        });
      });
    });
  });

  describe("deleting namespaces (cluser scoped resource)", () => {
    let api: NamespaceApi;

    beforeEach(() => {
      api = new NamespaceApi({
        request,
      });
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
          fetchMock.resolveSpecific(
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
          fetchMock.resolveSpecific(
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
      it("rejects request", () => {
        expect(api.delete({ name: "foo", namespace: "test" })).rejects.toBeDefined();
      });
    });
  });

  describe("watching pods", () => {
    let api: PodApi;
    let stream: PassThrough;

    beforeEach(() => {
      api = new PodApi({
        request,
      });
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
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=",
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
              const isMatch = url === "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=";

              if (isMatch) {
                init?.signal?.addEventListener("abort", () => {
                  stream.destroy();
                });
              }

              return isMatch;
            },
            createMockResponseFromStream("http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=", stream),
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
          "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=",
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
              const isMatch = url === "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=";

              if (isMatch) {
                init?.signal?.addEventListener("abort", () => {
                  stream.destroy();
                });
              }

              return isMatch;
            },
            createMockResponseFromStream("http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=", stream),
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
      api = new PodApi({
        request,
      });
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
      api = new PodApi({
        request,
      });
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
      api = new PodApi({
        request,
      });
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
