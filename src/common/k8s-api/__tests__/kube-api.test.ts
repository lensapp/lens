/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { forRemoteCluster, KubeApi } from "../kube-api";
import { KubeJsonApi } from "../kube-json-api";
import { KubeObject } from "../kube-object";
import AbortController from "abort-controller";
import { delay } from "../../utils/delay";
import { PassThrough } from "stream";
import type { ApiManager } from "../api-manager";
import { apiManager } from "../api-manager";
import type { FetchMock } from "jest-fetch-mock/types";

jest.mock("../api-manager");

const mockApiManager = apiManager as jest.Mocked<ApiManager>;
const mockFetch = fetch as FetchMock;

class TestKubeObject extends KubeObject {
  static kind = "Pod";
  static namespaced = true;
  static apiBase = "/api/v1/pods";
}

class TestKubeApi extends KubeApi<TestKubeObject> {
  public async checkPreferredVersion() {
    return super.checkPreferredVersion();
  }
}

describe("forRemoteCluster", () => {
  it("builds api client for KubeObject", async () => {
    const api = forRemoteCluster({
      cluster: {
        server: "https://127.0.0.1:6443",
      },
      user: {
        token: "daa",
      },
    }, TestKubeObject);

    expect(api).toBeInstanceOf(KubeApi);
  });

  it("builds api client for given KubeApi", async () => {
    const api = forRemoteCluster({
      cluster: {
        server: "https://127.0.0.1:6443",
      },
      user: {
        token: "daa",
      },
    }, TestKubeObject, TestKubeApi);

    expect(api).toBeInstanceOf(TestKubeApi);
  });

  it("calls right api endpoint", async () => {
    const api = forRemoteCluster({
      cluster: {
        server: "https://127.0.0.1:6443",
      },
      user: {
        token: "daa",
      },
    }, TestKubeObject);

    mockFetch.mockResponse(async (request: any) => {
      expect(request.url).toEqual("https://127.0.0.1:6443/api/v1/pods");

      return {
        body: "hello",
      };
    });

    expect.hasAssertions();

    await api.list();
  });
});

describe("KubeApi", () => {
  let request: KubeJsonApi;

  beforeEach(() => {
    request = new KubeJsonApi({
      serverAddress: `http://127.0.0.1:9999`,
      apiBase: "/api-kube",
    });
  });

  it("uses url from apiBase if apiBase contains the resource", async () => {
    mockFetch.mockResponse(async (request: any) => {
      if (request.url === "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1") {
        return {
          body: JSON.stringify({
            resources: [{
              name: "ingresses",
            }],
          }),
        };
      } else if (request.url === "http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1") {
        // Even if the old API contains ingresses, KubeApi should prefer the apiBase url
        return {
          body: JSON.stringify({
            resources: [{
              name: "ingresses",
            }],
          }),
        };
      } else {
        return {
          body: JSON.stringify({
            resources: [],
          }),
        };
      }
    });

    const apiBase = "/apis/networking.k8s.io/v1/ingresses";
    const fallbackApiBase = "/apis/extensions/v1beta1/ingresses";
    const kubeApi = new KubeApi({
      request,
      objectConstructor: KubeObject,
      apiBase,
      fallbackApiBases: [fallbackApiBase],
      checkPreferredVersion: true,
    });

    await kubeApi.get({
      name: "foo",
      namespace: "default",
    });
    expect(kubeApi.apiPrefix).toEqual("/apis");
    expect(kubeApi.apiGroup).toEqual("networking.k8s.io");
  });

  it("uses url from fallbackApiBases if apiBase lacks the resource", async () => {
    mockFetch.mockResponse(async (request: any) => {
      if (request.url === "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1") {
        return {
          body: JSON.stringify({
            resources: [],
          }),
        };
      } else if (request.url === "http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1") {
        return {
          body: JSON.stringify({
            resources: [{
              name: "ingresses",
            }],
          }),
        };
      } else {
        return {
          body: JSON.stringify({
            resources: [],
          }),
        };
      }
    });

    const apiBase = "apis/networking.k8s.io/v1/ingresses";
    const fallbackApiBase = "/apis/extensions/v1beta1/ingresses";
    const kubeApi = new KubeApi({
      request,
      objectConstructor: Object.assign(KubeObject, { apiBase }),
      fallbackApiBases: [fallbackApiBase],
      checkPreferredVersion: true,
    });

    await kubeApi.get({
      name: "foo",
      namespace: "default",
    });
    expect(kubeApi.apiPrefix).toEqual("/apis");
    expect(kubeApi.apiGroup).toEqual("extensions");
  });

  describe("checkPreferredVersion", () => {
    it("registers with apiManager if checkPreferredVersion changes apiVersionPreferred", async () => {
      expect.hasAssertions();

      const api = new TestKubeApi({
        objectConstructor: TestKubeObject,
        checkPreferredVersion: true,
        fallbackApiBases: ["/apis/extensions/v1beta1/ingresses"],
        request: {
          get: jest.fn()
            .mockImplementationOnce((path: string) => {
              expect(path).toBe("/apis/networking.k8s.io/v1");

              throw new Error("no");
            })
            .mockImplementationOnce((path: string) => {
              expect(path).toBe("/apis/extensions/v1beta1");

              return {
                resources: [
                  {
                    name: "ingresses",
                  },
                ],
              };
            })
            .mockImplementationOnce((path: string) => {
              expect(path).toBe("/apis/extensions");

              return {
                preferredVersion: {
                  version: "v1beta1",
                },
              };
            }),
        } as Partial<KubeJsonApi> as KubeJsonApi,
      });

      await api.checkPreferredVersion();

      expect(api.apiVersionPreferred).toBe("v1beta1");
      expect(mockApiManager.registerApi).toBeCalledWith("/apis/extensions/v1beta1/ingresses", expect.anything());
    });

    it("registers with apiManager if checkPreferredVersion changes apiVersionPreferred with non-grouped apis", async () => {
      expect.hasAssertions();

      const api = new TestKubeApi({
        objectConstructor: TestKubeObject,
        checkPreferredVersion: true,
        fallbackApiBases: ["/api/v1beta1/pods"],
        request: {
          get: jest.fn()
            .mockImplementationOnce((path: string) => {
              expect(path).toBe("/api/v1");

              throw new Error("no");
            })
            .mockImplementationOnce((path: string) => {
              expect(path).toBe("/api/v1beta1");

              return {
                resources: [
                  {
                    name: "pods",
                  },
                ],
              };
            })
            .mockImplementationOnce((path: string) => {
              expect(path).toBe("/api");

              return {
                preferredVersion: {
                  version: "v1beta1",
                },
              };
            }),
        } as Partial<KubeJsonApi> as KubeJsonApi,
      });

      await api.checkPreferredVersion();

      expect(api.apiVersionPreferred).toBe("v1beta1");
      expect(mockApiManager.registerApi).toBeCalledWith("/api/v1beta1/pods", expect.anything());
    });
  });

  describe("patch", () => {
    let api: TestKubeApi;

    beforeEach(() => {
      api = new TestKubeApi({
        request,
        objectConstructor: TestKubeObject,
      });
    });

    it("sends strategic patch by default", async () => {
      expect.hasAssertions();

      mockFetch.mockResponse(async request => {
        expect(request.method).toEqual("PATCH");
        expect(request.headers.get("content-type")).toMatch("strategic-merge-patch");
        expect(request.body?.toString()).toEqual(JSON.stringify({ spec: { replicas: 2 }}));

        return {};
      });

      await api.patch({ name: "test", namespace: "default" }, {
        spec: { replicas: 2 },
      });
    });

    it("allows to use merge patch", async () => {
      expect.hasAssertions();

      mockFetch.mockResponse(async request => {
        expect(request.method).toEqual("PATCH");
        expect(request.headers.get("content-type")).toMatch("merge-patch");
        expect(request.body?.toString()).toEqual(JSON.stringify({ spec: { replicas: 2 }}));

        return {};
      });

      await api.patch({ name: "test", namespace: "default" }, {
        spec: { replicas: 2 },
      }, "merge");
    });

    it("allows to use json patch", async () => {
      expect.hasAssertions();

      mockFetch.mockResponse(async request => {
        expect(request.method).toEqual("PATCH");
        expect(request.headers.get("content-type")).toMatch("json-patch");
        expect(request.body?.toString()).toEqual(JSON.stringify([{ op: "replace", path: "/spec/replicas", value: 2 }]));

        return {};
      });

      await api.patch({ name: "test", namespace: "default" }, [
        { op: "replace", path: "/spec/replicas", value: 2 },
      ], "json");
    });

    it("allows deep partial patch", async () => {
      expect.hasAssertions();

      mockFetch.mockResponse(async request => {
        expect(request.method).toEqual("PATCH");
        expect(request.headers.get("content-type")).toMatch("merge-patch");
        expect(request.body?.toString()).toEqual(JSON.stringify({ metadata: { annotations: { provisioned: "true" }}}));

        return {};
      });

      await api.patch(
        { name: "test", namespace: "default" },
        { metadata: { annotations: { provisioned: "true" }}},
        "merge",
      );
    });
  });

  describe("delete", () => {
    let api: TestKubeApi;

    beforeEach(() => {
      api = new TestKubeApi({
        request,
        objectConstructor: TestKubeObject,
      });
    });

    it("sends correct request with empty namespace", async () => {
      expect.hasAssertions();
      mockFetch.mockResponse(async request => {
        expect(request.method).toEqual("DELETE");
        expect(request.url).toEqual("http://127.0.0.1:9999/api-kube/api/v1/pods/foo?propagationPolicy=Background");

        return {};
      });

      await api.delete({ name: "foo", namespace: "" });
    });

    it("sends correct request without namespace", async () => {
      expect.hasAssertions();
      mockFetch.mockResponse(async request => {
        expect(request.method).toEqual("DELETE");
        expect(request.url).toEqual("http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foo?propagationPolicy=Background");

        return {};
      });

      await api.delete({ name: "foo" });
    });

    it("sends correct request with namespace", async () => {
      expect.hasAssertions();
      mockFetch.mockResponse(async request => {
        expect(request.method).toEqual("DELETE");
        expect(request.url).toEqual("http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods/foo?propagationPolicy=Background");

        return {};
      });

      await api.delete({ name: "foo", namespace: "kube-system" });
    });

    it("allows to change propagationPolicy", async () => {
      expect.hasAssertions();
      mockFetch.mockResponse(async request => {
        expect(request.method).toEqual("DELETE");
        expect(request.url).toMatch("propagationPolicy=Orphan");

        return {};
      });

      await api.delete({ name: "foo", namespace: "default", propagationPolicy: "Orphan" });
    });
  });

  describe("watch", () => {
    let api: TestKubeApi;
    let stream: PassThrough;

    beforeEach(() => {
      api = new TestKubeApi({
        request,
        objectConstructor: TestKubeObject,
      });
      stream = new PassThrough();
    });

    afterEach(() => {
      stream.end();
      stream.destroy();
    });

    it("sends a valid watch request", () => {
      const spy = jest.spyOn(request, "getResponse");

      mockFetch.mockResponse(async () => {
        return {
          // needed for https://github.com/jefflau/jest-fetch-mock/issues/218
          body: stream as unknown as string,
        };
      });

      api.watch({ namespace: "kube-system" });
      expect(spy).toHaveBeenCalledWith("/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=", expect.anything(), expect.anything());
    });

    it("sends timeout as a query parameter", async () => {
      const spy = jest.spyOn(request, "getResponse");

      mockFetch.mockResponse(async () => {
        return {
          // needed for https://github.com/jefflau/jest-fetch-mock/issues/218
          body: stream as unknown as string,
        };
      });

      api.watch({ namespace: "kube-system", timeout: 60 });
      expect(spy).toHaveBeenCalledWith("/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=", { query: { timeoutSeconds: 60 }}, expect.anything());
    });

    it("aborts watch using abortController", async (done) => {
      const spy = jest.spyOn(request, "getResponse");

      mockFetch.mockResponse(async request => {
        request.signal.addEventListener("abort", () => {
          done();
        });

        return {
          // needed for https://github.com/jefflau/jest-fetch-mock/issues/218
          body: stream as unknown as string,
        };
      });

      const abortController = new AbortController();

      api.watch({
        namespace: "kube-system",
        timeout: 60,
        abortController,
      });

      expect(spy).toHaveBeenCalledWith("/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=", { query: { timeoutSeconds: 60 }}, expect.anything());

      await delay(100);

      abortController.abort();
    });

    describe("retries", () => {
      it("if request ended", (done) => {
        const spy = jest.spyOn(request, "getResponse");

        jest.spyOn(stream, "on").mockImplementation((event: string | symbol, callback: Function) => {
          // End the request in 100ms.
          if (event === "end") {
            setTimeout(() => {
              callback();
            }, 100);
          }

          return stream;
        });

        // we need to mock using jest as jest-fetch-mock doesn't support mocking the body completely
        jest.spyOn(global, "fetch").mockImplementation(async () => {
          return {
            ok: true,
            body: stream as never,
          } as Partial<Response> as Response;
        });

        api.watch({
          namespace: "kube-system",
        });

        expect(spy).toHaveBeenCalledTimes(1);

        setTimeout(() => {
          expect(spy).toHaveBeenCalledTimes(2);
          done();
        }, 2000);
      });

      it("if request not closed after timeout", (done) => {
        const spy = jest.spyOn(request, "getResponse");

        mockFetch.mockResponse(async () => {
          return {
            // needed for https://github.com/jefflau/jest-fetch-mock/issues/218
            body: stream as unknown as string,
          };
        });

        const timeoutSeconds = 1;

        api.watch({
          namespace: "kube-system",
          timeout: timeoutSeconds,
        });

        expect(spy).toHaveBeenCalledTimes(1);

        setTimeout(() => {
          expect(spy).toHaveBeenCalledTimes(2);
          done();
        }, timeoutSeconds * 1000 * 1.2);
      });

      it("retries only once if request ends and timeout is set", (done) => {
        const spy = jest.spyOn(request, "getResponse");

        jest.spyOn(stream, "on").mockImplementation((event: string | symbol, callback: Function) => {
          // End the request in 100ms.
          if (event === "end") {
            setTimeout(() => {
              callback();
            }, 100);
          }

          return stream;
        });

        // we need to mock using jest as jest-fetch-mock doesn't support mocking the body completely
        jest.spyOn(global, "fetch").mockImplementation(async () => {
          return {
            ok: true,
            body: stream as never,
          } as Partial<Response> as Response;
        });

        const timeoutSeconds = 0.5;

        api.watch({
          namespace: "kube-system",
          timeout: timeoutSeconds,
        });

        expect(spy).toHaveBeenCalledTimes(1);

        setTimeout(() => {
          expect(spy).toHaveBeenCalledTimes(2);
          done();
        }, 2000);
      });

      afterEach(() => {
        jest.clearAllMocks();
      });
    });
  });

  describe("create", () => {
    let api: TestKubeApi;

    beforeEach(() => {
      api = new TestKubeApi({
        request,
        objectConstructor: TestKubeObject,
      });
    });

    it("should add kind and apiVersion", async () => {
      expect.hasAssertions();

      mockFetch.mockResponse(async request => {
        expect(request.method).toEqual("POST");
        expect(JSON.parse(String(request.body))).toEqual({
          kind: "Pod",
          apiVersion: "v1",
          metadata: {
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
        });

        return {};
      });

      await api.create({
        name: "foobar",
        namespace: "default",
      }, {
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
    });

    it("doesn't override metadata.labels", async () => {
      expect.hasAssertions();

      mockFetch.mockResponse(async request => {
        expect(request.method).toEqual("POST");
        expect(JSON.parse(String(request.body))).toEqual({
          kind: "Pod",
          apiVersion: "v1",
          metadata: {
            name: "foobar",
            namespace: "default",
            labels: {
              foo: "bar",
            },
          },
        });

        return {};
      });

      await api.create({
        name: "foobar",
        namespace: "default",
      }, {
        metadata: {
          labels: {
            foo: "bar",
          },
        },
      });
    });
  });

  describe("update", () => {
    let api: TestKubeApi;

    beforeEach(() => {
      api = new TestKubeApi({
        request,
        objectConstructor: TestKubeObject,
      });
    });

    it("doesn't override metadata.labels", async () => {
      expect.hasAssertions();

      mockFetch.mockResponse(async request => {
        expect(request.method).toEqual("PUT");
        expect(JSON.parse(String(request.body))).toEqual({
          metadata: {
            name: "foobar",
            namespace: "default",
            labels: {
              foo: "bar",
            },
          },
        });

        return {};
      });

      await api.update({
        name: "foobar",
        namespace: "default",
      }, {
        metadata: {
          labels: {
            foo: "bar",
          },
        },
      });
    });
  });
});
