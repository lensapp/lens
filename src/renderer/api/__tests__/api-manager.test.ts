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

import { Cluster } from "../../../main/cluster";
import { KubeObjectStore } from "../../kube-object.store";
import { ApiManager } from "../api-manager";
import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";

class TestApi extends KubeApi {
  protected async checkPreferredVersion() {
    return;
  }
}

describe("ApiManager", () => {
  beforeEach(() => {
    ApiManager.createInstance(new Cluster({
      id: "foobar",
      kubeConfigPath: "/foobar",
    }));
  });

  afterEach(() => {
    ApiManager.resetInstance();
  });

  describe("registerApi", () => {
    it("re-register store if apiBase changed", async () => {
      const apiBase = "apis/v1/foo";
      const fallbackApiBase = "/apis/extensions/v1beta1/foo";
      const kubeApi = new TestApi({
        objectConstructor: KubeObject,
        apiBase,
        fallbackApiBases: [fallbackApiBase],
        checkPreferredVersion: true,
      });

      ApiManager.getInstance().registerApi(apiBase, kubeApi);

      class TestStore extends KubeObjectStore<KubeObject> {
        api = kubeApi;
      }

      // Define to use test api for ingress store
      ApiManager.getInstance().registerStore(TestStore);

      // Test that store is returned with original apiBase
      expect(ApiManager.getInstance().getStore(kubeApi)).toBeInstanceOf(TestStore);

      // Change apiBase similar as checkPreferredVersion does
      Object.defineProperty(kubeApi, "apiBase", { value: fallbackApiBase });
      ApiManager.getInstance().registerApi(fallbackApiBase, kubeApi);

      // Test that store is returned with new apiBase
      expect(ApiManager.getInstance().getStore(kubeApi)).toBeInstanceOf(TestStore);
    });
  });
});
