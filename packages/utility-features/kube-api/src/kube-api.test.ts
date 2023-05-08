/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeApiWatchCallback } from "./kube-api";
import { PassThrough } from "stream";
import { Deployment, Pod } from "@k8slens/kube-object";
import type Fetch from "@k8slens/node-fetch";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { flushPromises } from "@k8slens/test-utils";
import type { IKubeWatchEvent } from "./kube-watch-event";
import type { KubeJsonApiDataFor, KubeJsonApiData } from "@k8slens/kube-object";
import { createMockResponseFromStream, createMockResponseFromString } from "./mock-responses";
import type { Logger } from "@k8slens/logger";
import { DeploymentApi, NamespaceApi, PodApi } from "./endpoints";
import { KubeJsonApi } from "./kube-json-api";

describe("KubeApi", () => {
  let fetchMock: AsyncFnMock<typeof Fetch>;
  let logger: Logger;
  let kubeJsonApi: KubeJsonApi;

  beforeEach(() => {
    fetchMock = asyncFn();

    logger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    } as any;

    kubeJsonApi = new KubeJsonApi(
      {
        fetch: fetchMock,
        logger,
      },
      {
        apiBase: "/api-kube",
        serverAddress: "http://127.0.0.1:9999",
      },
      {
        headers: {
          "content-type": "application/json",
        },
      },
    );
  });

  describe("patching deployments", () => {
    let api: DeploymentApi;

    beforeEach(() => {
      api = new DeploymentApi({
        logger,
        maybeKubeApi: kubeJsonApi,
      });
    });

    describe("when patching a resource without providing a strategy", () => {
      let patchRequest: Promise<Deployment | null>;

      beforeEach(async () => {
        patchRequest = api.patch(
          { name: "test", namespace: "default" },
          {
            spec: { replicas: 2 },
          },
        );

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
            body: JSON.stringify({ spec: { replicas: 2 } }),
          },
        ]);
      });

      describe("when the patch request resolves with data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test"],
            createMockResponseFromString(
              "http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test",
              JSON.stringify({
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
              }),
            ),
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
        patchRequest = api.patch(
          { name: "test", namespace: "default" },
          [{ op: "replace", path: "/spec/replicas", value: 2 }],
          "json",
        );

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
            body: JSON.stringify([{ op: "replace", path: "/spec/replicas", value: 2 }]),
          },
        ]);
      });

      describe("when the patch request resolves with data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test"],
            createMockResponseFromString(
              "http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test",
              JSON.stringify({
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
              }),
            ),
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
          { metadata: { annotations: { provisioned: "True" } } },
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
            body: JSON.stringify({ metadata: { annotations: { provisioned: "True" } } }),
          },
        ]);
      });

      describe("when the patch request resolves with data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test"],
            createMockResponseFromString(
              "http://127.0.0.1:9999/api-kube/apis/apps/v1/namespaces/default/deployments/test",
              JSON.stringify({
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
              }),
            ),
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
        logger,
        maybeKubeApi: kubeJsonApi,
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
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foo?propagationPolicy=Background"],
            createMockResponseFromString(
              "http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foo?propagationPolicy=Background",
              "{}",
            ),
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
            createMockResponseFromString(
              "http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foo?propagationPolicy=Background",
              "{}",
            ),
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
            createMockResponseFromString(
              "http://127.0.0.1:9999/api-kube/api/v1/namespaces/test/pods/foo?propagationPolicy=Background",
              "{}",
            ),
          );
        });

        it("resolves the call", async () => {
          expect(await deleteRequest).toBeDefined();
        });
      });
    });
  });

  describe("deleting namespaces (cluster scoped resource)", () => {
    let api: NamespaceApi;

    beforeEach(() => {
      api = new NamespaceApi({
        logger,
        maybeKubeApi: kubeJsonApi,
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
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/foo?propagationPolicy=Background"],
            createMockResponseFromString(
              "http://127.0.0.1:9999/api-kube/api/v1/namespaces/foo?propagationPolicy=Background",
              "{}",
            ),
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
            createMockResponseFromString(
              "http://127.0.0.1:9999/api-kube/api/v1/namespaces/foo?propagationPolicy=Background",
              "{}",
            ),
          );
        });

        it("resolves the call", async () => {
          expect(await deleteRequest).toBeDefined();
        });
      });
    });
  });

  describe("watching pods", () => {
    let api: PodApi;
    let stream: PassThrough;

    beforeEach(() => {
      api = new PodApi({
        logger,
        maybeKubeApi: kubeJsonApi,
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
          await fetchMock.resolveSpecific(([url, init]) => {
            const isMatch =
              url ===
              "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=600";

            if (isMatch) {
              init?.signal?.addEventListener("abort", () => {
                stream.destroy();
              });
            }

            return isMatch;
          }, createMockResponseFromStream("http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=600", stream));
        });

        describe("when some data comes back on the stream", () => {
          beforeEach(() => {
            stream.emit(
              "data",
              `${JSON.stringify({
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
              } as IKubeWatchEvent<KubeJsonApiDataFor<Pod>>)}\n`,
            );
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
          await fetchMock.resolveSpecific(([url, init]) => {
            const isMatch =
              url ===
              "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=600";

            if (isMatch) {
              init?.signal?.addEventListener("abort", () => {
                stream.destroy();
              });
            }

            return isMatch;
          }, createMockResponseFromStream("http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=600", stream));
        });

        describe("when some data comes back on the stream", () => {
          beforeEach(() => {
            stream.emit(
              "data",
              `${JSON.stringify({
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
              } as IKubeWatchEvent<KubeJsonApiDataFor<Pod>>)}\n`,
            );
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
          await fetchMock.resolveSpecific(([url, init]) => {
            const isMatch =
              url ===
              "http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=60";

            if (isMatch) {
              init?.signal?.addEventListener("abort", () => {
                stream.destroy();
              });
            }

            return isMatch;
          }, createMockResponseFromStream("http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=&timeoutSeconds=60", stream));
        });

        describe("when some data comes back on the stream", () => {
          beforeEach(() => {
            stream.emit(
              "data",
              `${JSON.stringify({
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
              } as IKubeWatchEvent<KubeJsonApiDataFor<Pod>>)}\n`,
            );
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
        logger,
        maybeKubeApi: kubeJsonApi,
      });
    });

    describe("when creating a pod", () => {
      let createRequest: Promise<Pod | null>;

      beforeEach(async () => {
        createRequest = api.create(
          {
            name: "foobar",
            namespace: "default",
          },
          {
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
          },
        );

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
              kind: "Pod",
              apiVersion: "v1",
            }),
          },
        ]);
      });

      describe("when request resolves with data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods"],
            createMockResponseFromString(
              "http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods",
              JSON.stringify({
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
              }),
            ),
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
        logger,
        maybeKubeApi: kubeJsonApi,
      });
    });

    describe("when updating a pod", () => {
      let updateRequest: Promise<Pod | null>;

      beforeEach(async () => {
        updateRequest = api.update(
          {
            name: "foobar",
            namespace: "default",
          },
          {
            kind: "Pod",
            apiVersion: "v1",
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
          },
        );

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
            }),
          },
        ]);
      });

      describe("when the request resolves with data", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foobar"],
            createMockResponseFromString(
              "http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foobar",
              JSON.stringify({
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
              }),
            ),
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
        logger,
        maybeKubeApi: kubeJsonApi,
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
            createMockResponseFromString(
              "http://127.0.0.1:9999/api-kube/api/v1/pods",
              JSON.stringify({
                kind: "PodList",
                apiVersion: "v1",
                metadata: {},
                items: [],
              }),
            ),
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
            createMockResponseFromString(
              "http://127.0.0.1:9999/api-kube/api/v1/pods",
              JSON.stringify({
                kind: "PodList",
                apiVersion: "v1",
                metadata: {},
                items: [],
              }),
            ),
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
            createMockResponseFromString(
              "http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods",
              JSON.stringify({
                kind: "PodList",
                apiVersion: "v1",
                metadata: {},
                items: [],
              }),
            ),
          );
        });

        it("the call should resolve to an empty list", async () => {
          expect(await listRequest).toEqual([]);
        });
      });
    });
  });
});
