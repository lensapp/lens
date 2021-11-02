/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Pod } from "../endpoints/pods.api";
import { forRemoteCluster, KubeApi } from "../kube-api";
import { KubeJsonApi } from "../kube-json-api";
import { KubeObject } from "../kube-object";

describe("forRemoteCluster", () => {
  it("builds api client", async (done) => {
    const api = forRemoteCluster({
      cluster: {
        server: "https://127.0.0.1:6443",
      },
      user: {
        token: "daa",
      },
    }, Pod);

    (fetch as any).mockResponse(async (request: any) => {
      expect(request.url).toEqual("https://127.0.0.1:6443/api/v1/pods");

      done();

      return {
        body: "",
      };
    });

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
    (fetch as any).mockResponse(async (request: any) => {
      if (request.url === "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1") {
        return {
          body: JSON.stringify({
            resources: [{
              name: "ingresses",
            }] as any[],
          }),
        };
      } else if (request.url === "http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1") {
        // Even if the old API contains ingresses, KubeApi should prefer the apiBase url
        return {
          body: JSON.stringify({
            resources: [{
              name: "ingresses",
            }] as any[],
          }),
        };
      } else {
        return {
          body: JSON.stringify({
            resources: [] as any[],
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

    await kubeApi.get();
    expect(kubeApi.apiPrefix).toEqual("/apis");
    expect(kubeApi.apiGroup).toEqual("networking.k8s.io");
  });

  it("uses url from fallbackApiBases if apiBase lacks the resource", async () => {
    (fetch as any).mockResponse(async (request: any) => {
      if (request.url === "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1") {
        return {
          body: JSON.stringify({
            resources: [] as any[],
          }),
        };
      } else if (request.url === "http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1") {
        return {
          body: JSON.stringify({
            resources: [{
              name: "ingresses",
            }] as any[],
          }),
        };
      } else {
        return {
          body: JSON.stringify({
            resources: [] as any[],
          }),
        };
      }
    });

    const apiBase = "apis/networking.k8s.io/v1/ingresses";
    const fallbackApiBase = "/apis/extensions/v1beta1/ingresses";
    const kubeApi = new KubeApi({
      request,
      objectConstructor: KubeObject,
      apiBase,
      fallbackApiBases: [fallbackApiBase],
      checkPreferredVersion: true,
    });

    await kubeApi.get();
    expect(kubeApi.apiPrefix).toEqual("/apis");
    expect(kubeApi.apiGroup).toEqual("extensions");
  });
});
