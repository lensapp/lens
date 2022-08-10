/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { KubeApi } from "../kube-api";
import { KubeJsonApi } from "../kube-json-api";
import { KubeObject } from "../kube-object";
import { delay } from "../../utils/delay";
import { PassThrough } from "stream";
import type { ApiManager } from "../api-manager";
import { DeploymentApi, Ingress, IngressApi, Pod, PodApi } from "../endpoints";
import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import apiManagerInjectable from "../api-manager/manager.injectable";
import autoRegistrationInjectable from "../api-manager/auto-registration.injectable";
import type { JsonApiDependencies } from "../json-api";
import loggerInjectable from "../../logger.injectable";
import type { Fetch } from "../../fetch/fetch.injectable";
import fetchInjectable from "../../fetch/fetch.injectable";
import type { CreateKubeApiForRemoteCluster } from "../create-kube-api-for-remote-cluster.injectable";
import createKubeApiForRemoteClusterInjectable from "../create-kube-api-for-remote-cluster.injectable";
import { Headers, Response } from "node-fetch";
import AbortController from "abort-controller";

describe("createKubeApiForRemoteCluster", () => {
  let createKubeApiForRemoteCluster: CreateKubeApiForRemoteCluster;
  let fetchMock: jest.MockedFunction<Fetch>;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    fetchMock = jest.fn();
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

  it("builds api client for given KubeApi", async () => {
    const api = createKubeApiForRemoteCluster({
      cluster: {
        server: "https://127.0.0.1:6443",
      },
      user: {
        token: "daa",
      },
    }, Pod, PodApi);

    expect(api).toBeInstanceOf(PodApi);
  });

  it("calls right api endpoint", async () => {
    const api = createKubeApiForRemoteCluster({
      cluster: {
        server: "https://127.0.0.1:6443",
      },
      user: {
        token: "daa",
      },
    }, Pod);

    fetchMock.mockImplementation(async (url) => {
      expect(url).toBe("https://127.0.0.1:6443/api/v1/pods");

      return new Response("hello");
    });

    expect(await api.list()).toBeNull();
  });
});

describe("KubeApi", () => {
  let request: KubeJsonApi;
  let registerApiSpy: jest.SpiedFunction<ApiManager["registerApi"]>;
  let fetchMock: jest.MockedFunction<Fetch>;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    fetchMock = jest.fn();
    di.override(fetchInjectable, () => fetchMock);

    const dependencies: JsonApiDependencies = {
      logger: di.inject(loggerInjectable),
      fetch: di.inject(fetchInjectable),
    };

    request = new KubeJsonApi(dependencies, {
      serverAddress: `http://127.0.0.1:9999`,
      apiBase: "/api-kube",
    });
    registerApiSpy = jest.spyOn(di.inject(apiManagerInjectable), "registerApi");

    di.inject(autoRegistrationInjectable);
  });

  it("uses url from apiBase if apiBase contains the resource", async () => {
    const apiBase = "/apis/networking.k8s.io/v1/ingresses";
    const fallbackApiBase = "/apis/extensions/v1beta1/ingresses";
    const kubeApi = new IngressApi({
      request,
      objectConstructor: Ingress,
      apiBase,
      fallbackApiBases: [fallbackApiBase],
      checkPreferredVersion: true,
    });

    fetchMock.mockImplementation(async (url) => {
      if (url === "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1") {
        return new Response(JSON.stringify({
          resources: [{
            name: "ingresses",
          }],
        }));
      }

      if (url === "http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1") {
        return new Response(JSON.stringify({
          resources: [{
            name: "ingresses",
          }],
        }));
      }

      return new Response(JSON.stringify({ resources: [] }));
    });

    fetchMock.mockImplementation(async (url) => {
      if (url === "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1") {
        return new Response(JSON.stringify({
          resources: [{
            name: "ingresses",
          }],
        }));
      }

      if (url === "http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1") {
        return new Response(JSON.stringify({
          resources: [{
            name: "ingresses",
          }],
        }));
      }

      return new Response(JSON.stringify({ resources: [] }));
    });

    await kubeApi.get({
      name: "foo",
      namespace: "default",
    });
    expect(kubeApi.apiPrefix).toEqual("/apis");
    expect(kubeApi.apiGroup).toEqual("networking.k8s.io");
  });

  it("uses url from fallbackApiBases if apiBase lacks the resource", async () => {
    const apiBase = "apis/networking.k8s.io/v1/ingresses";
    const fallbackApiBase = "/apis/extensions/v1beta1/ingresses";
    const kubeApi = new IngressApi({
      request,
      objectConstructor: Object.assign(KubeObject, { apiBase }),
      kind: "Ingress",
      fallbackApiBases: [fallbackApiBase],
      checkPreferredVersion: true,
    });


    fetchMock.mockImplementation(async (url) => {
      if (url === "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1") {
        return new Response(JSON.stringify({
          resources: [],
        }));
      }

      if (url === "http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1") {
        return new Response(JSON.stringify({
          resources: [{
            name: "ingresses",
          }],
        }));
      }

      return new Response(JSON.stringify({ resources: [] }));
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

      const api = new IngressApi({
        objectConstructor: Ingress,
        checkPreferredVersion: true,
        fallbackApiBases: ["/apis/extensions/v1beta1/ingresses"],
        request: {
          get: jest.fn()
            .mockImplementation((path: string) => {
              switch (path) {
                case "/apis/networking.k8s.io/v1":
                  throw new Error("no");
                case "/apis/extensions/v1beta1":
                  return {
                    resources: [
                      {
                        name: "ingresses",
                      },
                    ],
                  };
                case "/apis/extensions":
                  return {
                    preferredVersion: {
                      version: "v1beta1",
                    },
                  };
                default:
                  throw new Error("unknown path");
              }
            }),
        } as Partial<KubeJsonApi> as KubeJsonApi,
      });

      await (api as any).checkPreferredVersion();

      expect(api.apiVersionPreferred).toBe("v1beta1");
      expect(registerApiSpy).toBeCalledWith(api);
    });

    it("registers with apiManager if checkPreferredVersion changes apiVersionPreferred with non-grouped apis", async () => {
      expect.hasAssertions();

      const api = new PodApi({
        objectConstructor: Pod,
        checkPreferredVersion: true,
        fallbackApiBases: ["/api/v1beta1/pods"],
        request: {
          get: jest.fn()
            .mockImplementation((path: string) => {
              switch (path) {
                case "/api/v1":
                  throw new Error("no");
                case "/api/v1beta1":
                  return {
                    resources: [
                      {
                        name: "pods",
                      },
                    ],
                  };
                case "/api":
                  return {
                    preferredVersion: {
                      version: "v1beta1",
                    },
                  };
                default:
                  throw new Error("unknown path");
              }
            }),
        } as Partial<KubeJsonApi> as KubeJsonApi,
      });

      await (api as any).checkPreferredVersion();

      expect(api.apiVersionPreferred).toBe("v1beta1");
      expect(registerApiSpy).toBeCalledWith(api);
    });
  });

  describe("patch", () => {
    let api: DeploymentApi;

    beforeEach(() => {
      api = new DeploymentApi({
        request,
      });
    });

    it("sends strategic patch by default", async () => {
      expect.hasAssertions();

      fetchMock.mockImplementation(async (url, init) => {
        expect(init?.method).toEqual("patch");
        expect(new Headers(init?.headers).get("content-type")).toMatch("strategic-merge-patch");
        expect(init?.body?.toString()).toEqual(JSON.stringify({ spec: { replicas: 2 }}));

        return new Response();
      });

      await api.patch({ name: "test", namespace: "default" }, {
        spec: { replicas: 2 },
      });
    });

    it("allows to use merge patch", async () => {
      expect.hasAssertions();

      fetchMock.mockImplementation(async (url, init) => {
        expect(init?.method).toEqual("patch");
        expect(new Headers(init?.headers).get("content-type")).toMatch("merge-patch");
        expect(init?.body?.toString()).toEqual(JSON.stringify({ spec: { replicas: 2 }}));

        return new Response();
      });

      await api.patch({ name: "test", namespace: "default" }, {
        spec: { replicas: 2 },
      }, "merge");
    });

    it("allows to use json patch", async () => {
      expect.hasAssertions();

      fetchMock.mockImplementation(async (url, init) => {
        expect(init?.method).toEqual("patch");
        expect(new Headers(init?.headers).get("content-type")).toMatch("json-patch");
        expect(init?.body?.toString()).toEqual(JSON.stringify([{ op: "replace", path: "/spec/replicas", value: 2 }]));

        return new Response();
      });

      await api.patch({ name: "test", namespace: "default" }, [
        { op: "replace", path: "/spec/replicas", value: 2 },
      ], "json");
    });

    it("allows deep partial patch", async () => {
      expect.hasAssertions();

      fetchMock.mockImplementation(async (url, init) => {
        expect(init?.method).toEqual("patch");
        expect(new Headers(init?.headers).get("content-type")).toMatch("merge-patch");
        expect(init?.body?.toString()).toEqual(JSON.stringify({ metadata: { annotations: { provisioned: "true" }}}));

        return new Response();
      });

      await api.patch(
        { name: "test", namespace: "default" },
        { metadata: { annotations: { provisioned: "true" }}},
        "merge",
      );
    });
  });

  describe("delete", () => {
    let api: PodApi;

    beforeEach(() => {
      api = new PodApi({
        request,
        objectConstructor: Pod,
      });
    });

    it("sends correct request with empty namespace", async () => {
      expect.hasAssertions();
      fetchMock.mockImplementation(async (url, init) => {
        expect(init?.method).toEqual("delete");
        expect(url).toEqual("http://127.0.0.1:9999/api-kube/api/v1/pods/foo?propagationPolicy=Background");

        return new Response();
      });

      await api.delete({ name: "foo", namespace: "" });
    });

    it("sends correct request without namespace", async () => {
      expect.hasAssertions();
      fetchMock.mockImplementation(async (url, init) => {
        expect(init?.method).toEqual("delete");
        expect(url).toEqual("http://127.0.0.1:9999/api-kube/api/v1/namespaces/default/pods/foo?propagationPolicy=Background");

        return new Response();
      });

      await api.delete({ name: "foo" });
    });

    it("sends correct request with namespace", async () => {
      expect.hasAssertions();
      fetchMock.mockImplementation(async (url, init) => {
        expect(init?.method).toEqual("delete");
        expect(url).toEqual("http://127.0.0.1:9999/api-kube/api/v1/namespaces/kube-system/pods/foo?propagationPolicy=Background");

        return new Response();
      });

      await api.delete({ name: "foo", namespace: "kube-system" });
    });

    it("allows to change propagationPolicy", async () => {
      expect.hasAssertions();
      fetchMock.mockImplementation(async (url, init) => {
        expect(init?.method).toEqual("delete");
        expect(url).toMatch("propagationPolicy=Orphan");

        return new Response();
      });

      await api.delete({ name: "foo", namespace: "default", propagationPolicy: "Orphan" });
    });
  });

  describe("watch", () => {
    let api: PodApi;
    let stream: PassThrough;

    beforeEach(() => {
      api = new PodApi({
        request,
        objectConstructor: Pod,
      });
      stream = new PassThrough();
    });

    afterEach(() => {
      stream.end();
      stream.destroy();
    });

    it("sends a valid watch request", () => {
      const spy = jest.spyOn(request, "getResponse");

      fetchMock.mockImplementation(async () => {
        return new Response(stream);
      });

      api.watch({ namespace: "kube-system" });
      expect(spy).toHaveBeenCalledWith("/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=", expect.anything(), expect.anything());
    });

    it("sends timeout as a query parameter", async () => {
      const spy = jest.spyOn(request, "getResponse");

      fetchMock.mockImplementation(async () => {
        return new Response(stream);
      });

      api.watch({ namespace: "kube-system", timeout: 60 });
      expect(spy).toHaveBeenCalledWith("/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=", { query: { timeoutSeconds: 60 }}, expect.anything());
    });

    it("aborts watch using abortController", (done) => {
      const spy = jest.spyOn(request, "getResponse");

      fetchMock.mockImplementation(async (url, init) => {
        init?.signal?.addEventListener("abort", () => {
          done();
        });

        return new Response(stream);
      });

      const abortController = new AbortController();

      api.watch({
        namespace: "kube-system",
        timeout: 60,
        abortController,
      });

      expect(spy).toHaveBeenCalledWith("/api/v1/namespaces/kube-system/pods?watch=1&resourceVersion=", { query: { timeoutSeconds: 60 }}, expect.anything());
      delay(100).then(() => abortController.abort());
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

        fetchMock.mockImplementation(async () => {
          return new Response(stream, {
            status: 200,
          });
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

        fetchMock.mockImplementation(async () => {
          return new Response(stream);
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
        fetchMock.mockImplementation(async () => {
          return new Response(stream, {
            status: 200,
          });
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
    let api: PodApi;

    beforeEach(() => {
      api = new PodApi({
        request,
        objectConstructor: Pod,
      });
    });

    it("should add kind and apiVersion", async () => {
      expect.hasAssertions();

      fetchMock.mockImplementation(async (url, init) => {
        expect(init?.method).toEqual("post");
        expect(JSON.parse(String(init?.body))).toEqual({
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

        return new Response();
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

      fetchMock.mockImplementation(async (url, init) => {
        expect(init?.method).toEqual("post");
        expect(JSON.parse(String(init?.body))).toEqual({
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

        return new Response();
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
    let api: PodApi;

    beforeEach(() => {
      api = new PodApi({
        request,
        objectConstructor: Pod,
      });
    });

    it("doesn't override metadata.labels", async () => {
      expect.hasAssertions();

      fetchMock.mockImplementation(async (url, init) => {
        expect(init?.method).toEqual("put");
        expect(JSON.parse(String(init?.body))).toEqual({
          metadata: {
            name: "foobar",
            namespace: "default",
            labels: {
              foo: "bar",
            },
          },
        });

        return new Response();
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
